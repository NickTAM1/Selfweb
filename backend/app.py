"""Small Flask API for the portfolio's live GitHub signal.

The frontend can run without this service, but when it is deployed it keeps
GitHub requests server-side, caches them, and combines both public identities.
"""

from datetime import datetime, timedelta, timezone
import json
import os
import time
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from flask import Flask, jsonify, request

app = Flask(__name__)

DEFAULT_ACCOUNTS = ("NickTAM1", "HUKLIA")
CACHE_TTL_SECONDS = 10 * 60
stats_cache = {"expires_at": 0, "payload": None}
contributions_cache = {"expires_at": 0, "payload": None}


def configured_accounts():
    raw_accounts = os.getenv("GITHUB_ACCOUNTS", ",".join(DEFAULT_ACCOUNTS))
    accounts = tuple(account.strip() for account in raw_accounts.split(",") if account.strip())
    return accounts or DEFAULT_ACCOUNTS


def github_json(path):
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "selfweb-portfolio-github-signal",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    token = os.getenv("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"

    request_object = Request(f"https://api.github.com{path}", headers=headers)
    with urlopen(request_object, timeout=8) as response:
        return json.loads(response.read().decode("utf-8"))


def github_graphql(query, variables):
    token = os.getenv("GITHUB_TOKEN")
    if not token:
        raise RuntimeError("GITHUB_TOKEN is not configured")

    payload = json.dumps({"query": query, "variables": variables}).encode("utf-8")
    headers = {
        "Accept": "application/vnd.github+json",
        "Content-Type": "application/json",
        "User-Agent": "selfweb-portfolio-github-signal",
        "X-GitHub-Api-Version": "2022-11-28",
        "Authorization": f"Bearer {token}",
    }
    request_object = Request("https://api.github.com/graphql", data=payload, headers=headers, method="POST")
    with urlopen(request_object, timeout=10) as response:
        body = json.loads(response.read().decode("utf-8"))

    if body.get("errors"):
        message = "; ".join(error.get("message", "GitHub GraphQL error") for error in body["errors"])
        raise ValueError(message)
    return body.get("data", {})


CONTRIBUTION_QUERY = """
query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
          }
        }
      }
    }
  }
}
"""


def contribution_level(count, maximum):
    if count <= 0 or maximum <= 0:
        return 0
    ratio = count / maximum
    if ratio <= 0.25:
        return 1
    if ratio <= 0.5:
        return 2
    if ratio <= 0.75:
        return 3
    return 4


def build_calendar(day_counts):
    today = datetime.now(timezone.utc).date()
    year_ago = today - timedelta(days=364)
    # GitHub's calendar starts weeks on Sunday. Pad the edges so every column
    # has a stable seven-cell shape in the frontend heatmap.
    start = year_ago - timedelta(days=(year_ago.weekday() + 1) % 7)
    end = today + timedelta(days=6 - ((today.weekday() + 1) % 7))
    maximum = max(day_counts.values(), default=0)
    weeks = []
    cursor = start

    while cursor <= end:
        week = []
        for offset in range(7):
            current = cursor + timedelta(days=offset)
            count = day_counts.get(current.isoformat(), 0)
            week.append(
                {
                    "date": current.isoformat(),
                    "count": count,
                    "level": contribution_level(count, maximum),
                    "in_range": year_ago <= current <= today,
                }
            )
        weeks.append(week)
        cursor += timedelta(days=7)

    return weeks


def public_event_counts():
    counts_by_account = {}
    combined = {}
    for login in configured_accounts():
        account_counts = {}
        events = github_json(f"/users/{login}/events/public?per_page=100")
        for event in events:
            created_at = event.get("created_at")
            if not created_at:
                continue
            count = 1
            if event.get("type") == "PushEvent":
                count = max(1, len(event.get("payload", {}).get("commits", [])))
            day = created_at[:10]
            account_counts[day] = account_counts.get(day, 0) + count
            combined[day] = combined.get(day, 0) + count
        counts_by_account[login] = account_counts
    return counts_by_account, combined


def contribution_calendar_from_github():
    counts_by_account = {}
    combined = {}
    for login in configured_accounts():
        data = github_graphql(CONTRIBUTION_QUERY, {"login": login})
        user_data = data.get("user") or {}
        collection = user_data.get("contributionsCollection") or {}
        calendar = collection.get("contributionCalendar")
        if not calendar:
            raise ValueError(f"GitHub contribution calendar unavailable for {login}")

        account_counts = {}
        for week in calendar.get("weeks", []):
            for day in week.get("contributionDays", []):
                date = day["date"]
                count = int(day.get("contributionCount", 0))
                account_counts[date] = count
                combined[date] = combined.get(date, 0) + count
        counts_by_account[login] = account_counts
    return counts_by_account, combined


def build_contributions():
    has_token = bool(os.getenv("GITHUB_TOKEN"))
    source = "contribution-calendar"
    try:
        if has_token:
            counts_by_account, combined = contribution_calendar_from_github()
        else:
            counts_by_account, combined = public_event_counts()
            source = "public-events"
    except (HTTPError, URLError, TimeoutError, RuntimeError, ValueError):
        if not has_token:
            raise
        # A token without access to one account's calendar should not blank
        # the page; fall back to the public activity feed instead.
        counts_by_account, combined = public_event_counts()
        source = "public-events"

    weeks = build_calendar(combined)
    return {
        "source": source,
        "label": "Both GitHub contribution calendars" if source == "contribution-calendar" else "Both GitHub public activity feeds",
        "synced_at": datetime.now(timezone.utc).isoformat(),
        "accounts": [
            {"login": login, "total": sum(counts.values())}
            for login, counts in counts_by_account.items()
        ],
        "total": sum(day["count"] for week in weeks for day in week if day["in_range"]),
        "weeks": weeks,
    }


def build_stats():
    accounts = []
    total_repos = 0
    total_followers = 0
    total_following = 0
    total_stars = 0

    for login in configured_accounts():
        profile = github_json(f"/users/{login}")
        repos = github_json(f"/users/{login}/repos?per_page=100&sort=updated")
        stars = sum(int(repo.get("stargazers_count", 0)) for repo in repos)

        accounts.append(
            {
                "login": profile.get("login", login),
                "name": profile.get("name"),
                "avatar_url": profile.get("avatar_url"),
                "href": profile.get("html_url", f"https://github.com/{login}"),
                "public_repos": profile.get("public_repos", 0),
                "followers": profile.get("followers", 0),
                "following": profile.get("following", 0),
                "repo_stars": stars,
                "updated_at": profile.get("updated_at"),
            }
        )
        total_repos += profile.get("public_repos", 0)
        total_followers += profile.get("followers", 0)
        total_following += profile.get("following", 0)
        total_stars += stars

    return {
        "source": "github-api",
        "synced_at": datetime.now(timezone.utc).isoformat(),
        "accounts": accounts,
        "totals": {
            "public_repos": total_repos,
            "followers": total_followers,
            "following": total_following,
            "stars": total_stars,
        },
    }


@app.after_request
def add_cors_headers(response):
    allowed_origin = os.getenv("CORS_ORIGIN", "*")
    response.headers["Access-Control-Allow-Origin"] = allowed_origin
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
    response.headers["Cache-Control"] = "public, max-age=300"
    return response


@app.get("/api/health")
def health():
    return jsonify({"ok": True, "service": "selfweb-backend"})


@app.route("/api/github/stats", methods=["GET", "OPTIONS"])
def github_stats():
    if request.method == "OPTIONS":
        return ("", 204)

    now = time.time()
    if stats_cache["payload"] and stats_cache["expires_at"] > now:
        return jsonify(stats_cache["payload"])

    try:
        payload = build_stats()
    except (HTTPError, URLError, TimeoutError, ValueError) as error:
        return jsonify({"error": "GitHub stats are temporarily unavailable", "detail": str(error)}), 502

    stats_cache["payload"] = payload
    stats_cache["expires_at"] = now + CACHE_TTL_SECONDS
    return jsonify(payload)


@app.route("/api/github/contributions", methods=["GET", "OPTIONS"])
def github_contributions():
    if request.method == "OPTIONS":
        return ("", 204)

    now = time.time()
    if contributions_cache["payload"] and contributions_cache["expires_at"] > now:
        return jsonify(contributions_cache["payload"])

    try:
        payload = build_contributions()
    except (HTTPError, URLError, TimeoutError, RuntimeError, ValueError) as error:
        return jsonify(
            {"error": "GitHub contribution activity is temporarily unavailable", "detail": str(error)}
        ), 502

    contributions_cache["payload"] = payload
    contributions_cache["expires_at"] = now + CACHE_TTL_SECONDS
    return jsonify(payload)


if __name__ == "__main__":
    app.run(
        debug=os.getenv("FLASK_DEBUG", "0") == "1",
        host=os.getenv("FLASK_HOST", "127.0.0.1"),
        port=int(os.getenv("PORT", "5000")),
    )
