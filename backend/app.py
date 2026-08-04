"""Small Flask API for the portfolio's live GitHub signal.

The frontend can run without this service, but when it is deployed it keeps
GitHub requests server-side, caches them, and combines both public identities.
"""

from datetime import datetime, timezone
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


if __name__ == "__main__":
    app.run(
        debug=os.getenv("FLASK_DEBUG", "0") == "1",
        host=os.getenv("FLASK_HOST", "127.0.0.1"),
        port=int(os.getenv("PORT", "5000")),
    )
