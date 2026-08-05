import { useEffect, useState } from "react";
import { motion } from "motion/react";
import Reveal from "./Reveal.jsx";

const ACCOUNTS = [
  { login: "NickTAM1", href: "https://github.com/NickTAM1" },
  { login: "HUKLIA", href: "https://github.com/HUKLIA" },
];

const EMPTY_STATS = {
  accounts: ACCOUNTS.map((account) => ({ ...account })),
  totals: { public_repos: null, followers: null, stars: null },
  source: "profile-links",
};

function apiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL;
  const localDevelopmentUrl = import.meta.env.DEV ? "http://127.0.0.1:5000" : "";
  return String(configuredUrl || localDevelopmentUrl).replace(/\/$/, "");
}

async function loadGitHubStats() {
  const configuredApi = apiBaseUrl();
  if (configuredApi) {
    const response = await fetch(`${configuredApi}/api/github/stats`);
    if (!response.ok) throw new Error(`GitHub stats API returned ${response.status}`);
    return response.json();
  }

  // GitHub Pages can still show profile-level numbers without a separate
  // server. The Flask API adds repo stars and caching when configured.
  const responses = await Promise.all(
    ACCOUNTS.map(async (account) => {
      const response = await fetch(`https://api.github.com/users/${account.login}`, {
        headers: { Accept: "application/vnd.github+json" },
      });
      if (!response.ok) throw new Error(`GitHub profile returned ${response.status}`);
      const profile = await response.json();
      return {
        ...account,
        name: profile.name,
        avatar_url: profile.avatar_url,
        public_repos: profile.public_repos,
        followers: profile.followers,
        following: profile.following,
      };
    })
  );

  return {
    accounts: responses,
    totals: {
      public_repos: responses.reduce((total, account) => total + account.public_repos, 0),
      followers: responses.reduce((total, account) => total + account.followers, 0),
      stars: null,
    },
    source: "github-public",
  };
}

async function loadGitHubContributions() {
  const configuredApi = apiBaseUrl();
  if (configuredApi) {
    try {
      const response = await fetch(`${configuredApi}/api/github/contributions`);
      if (response.ok) return response.json();
    } catch {
      // The browser fallback below keeps the chart useful when Flask is offline.
    }
  }

  try {
    const accountCounts = await Promise.all(
      ACCOUNTS.map(async (account) => {
        const response = await fetch(`https://api.github.com/users/${account.login}/events/public?per_page=100`, {
          headers: { Accept: "application/vnd.github+json" },
        });
        if (!response.ok) throw new Error(`GitHub activity returned ${response.status}`);

        const counts = {};
        const events = await response.json();
        events.forEach((event) => {
          const date = event.created_at?.slice(0, 10);
          if (!date) return;
          const amount = event.type === "PushEvent"
            ? Math.max(1, event.payload?.commits?.length || 0)
            : 1;
          counts[date] = (counts[date] || 0) + amount;
        });
        return { login: account.login, counts };
      }),
    );

    return buildContributionPayload(accountCounts, "github-public-events", "Public activity snapshot");
  } catch {
    return buildContributionPayload(
      ACCOUNTS.map((account) => ({ login: account.login, counts: {} })),
      "local-preview",
      "Offline visual preview — live activity unavailable",
    );
  }
}

function contributionLevel(count, maximum) {
  if (!count || !maximum) return 0;
  const ratio = count / maximum;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

function buildContributionWeeks(dayCounts) {
  const today = new Date();
  const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const yearAgo = new Date(todayUtc);
  yearAgo.setUTCDate(yearAgo.getUTCDate() - 364);
  const start = new Date(yearAgo);
  start.setUTCDate(start.getUTCDate() - start.getUTCDay());
  const end = new Date(todayUtc);
  end.setUTCDate(end.getUTCDate() + (6 - end.getUTCDay()));
  const maximum = Math.max(...Object.values(dayCounts), 0);
  const weeks = [];

  for (let cursor = new Date(start); cursor <= end; cursor.setUTCDate(cursor.getUTCDate() + 7)) {
    const week = [];
    for (let offset = 0; offset < 7; offset += 1) {
      const current = new Date(cursor);
      current.setUTCDate(current.getUTCDate() + offset);
      const date = current.toISOString().slice(0, 10);
      const count = dayCounts[date] || 0;
      week.push({
        date,
        count,
        level: contributionLevel(count, maximum),
        in_range: current >= yearAgo && current <= todayUtc,
      });
    }
    weeks.push(week);
  }

  return weeks;
}

function buildContributionPayload(accountCounts, source, label) {
  const combinedCounts = {};
  accountCounts.forEach(({ counts }) => {
    Object.entries(counts).forEach(([date, count]) => {
      combinedCounts[date] = (combinedCounts[date] || 0) + count;
    });
  });
  const weeks = buildContributionWeeks(combinedCounts);

  return {
    source,
    label,
    synced_at: new Date().toISOString(),
    accounts: accountCounts.map(({ login, counts }) => ({
      login,
      total: Object.values(counts).reduce((total, count) => total + count, 0),
    })),
    total: weeks.reduce(
      (total, week) => total + week.reduce((weekTotal, day) => weekTotal + (day.in_range ? day.count : 0), 0),
      0,
    ),
    weeks,
  };
}

function displayNumber(value) {
  return typeof value === "number" ? value.toLocaleString() : "—";
}

function getMonthLabels(weeks) {
  const labels = [];
  let previousMonth = "";

  weeks.forEach((week, weekIndex) => {
    const referenceDay = week.find((day) => day.in_range) || week[0];
    const monthKey = referenceDay?.date?.slice(0, 7);
    if (!monthKey || monthKey === previousMonth) return;

    labels.push({
      key: monthKey,
      index: weekIndex,
      label: new Intl.DateTimeFormat("en-US", { month: "short" }).format(
        new Date(`${monthKey}-01T00:00:00Z`),
      ),
    });
    previousMonth = monthKey;
  });

  return labels;
}

function ContributionHeatmap({ state }) {
  const data = state.data;
  const hasCalendar = Boolean(data?.weeks?.length);
  const monthLabels = hasCalendar ? getMonthLabels(data.weeks) : [];
  const statusLabel = data
    ? data.source === "contribution-calendar"
      ? "CONTRIBUTION CALENDAR"
      : data.source === "github-public-events"
        ? "PUBLIC EVENTS"
        : data.source === "local-preview"
          ? "LOCAL PREVIEW"
      : "PUBLIC ACTIVITY FALLBACK"
    : state.status === "loading"
      ? "SYNCING"
      : "LOCAL PREVIEW";
  const contributionSummary = data?.source === "local-preview"
    ? "OFFLINE VISUAL PREVIEW"
    : data
      ? `${displayNumber(data.total)} contributions in the last year`
      : statusLabel;

  return (
    <div className="github-contributions">
      <div className="contribution-heading">
        <div>
          <span className="mono-label accent">COMBINED ACTIVITY</span>
          <h3>A year of making things</h3>
        </div>
        <span className="contribution-total">
          {contributionSummary}
        </span>
      </div>
      {hasCalendar ? (
        <>
          <div className="contribution-calendar">
            <div className="contribution-months" aria-hidden="true">
              {monthLabels.map((month) => (
                <span
                  className="contribution-month-label"
                  key={month.key}
                  style={{ gridColumn: month.index + 1 }}
                >
                  {month.label}
                </span>
              ))}
            </div>
            <div className="contribution-grid" aria-label="Combined GitHub contribution calendar">
              {data.weeks.map((week, weekIndex) => (
                <div className="contribution-week" key={`week-${weekIndex}`}>
                  {week.map((day) => (
                    <span
                      className={`contribution-cell contribution-level-${day.level}${day.in_range ? "" : " is-outside"}`}
                      key={day.date}
                      title={`${day.count} contribution${day.count === 1 ? "" : "s"} on ${day.date}`}
                      aria-label={`${day.count} contributions on ${day.date}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="contribution-footer">
            <span className="mono-label">{data.label}</span>
            <div className="contribution-legend" aria-hidden="true">
              <span>Less</span>
              {[0, 1, 2, 3, 4].map((level) => (
                <span className={`contribution-cell contribution-level-${level}`} key={level} />
              ))}
              <span>More</span>
            </div>
          </div>
          <div className="contribution-accounts">
            {data.accounts.map((account) => (
              <span key={account.login}>
                <strong>{account.login}</strong> {displayNumber(account.total)}
              </span>
            ))}
          </div>
        </>
      ) : (
        <div className="contribution-empty">
          <span className="signal-dot" aria-hidden="true" />
          <p>
            Combining both GitHub activity feeds in the browser...
          </p>
        </div>
      )}
    </div>
  );
}

export default function GitHubActivity() {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [contributionState, setContributionState] = useState({ status: "loading", data: null });

  useEffect(() => {
    let active = true;
    loadGitHubStats()
      .then((nextStats) => {
        if (active) setStats(nextStats);
      })
      .catch(() => {
        // Links and the section remain useful when GitHub or the optional API
        // is unavailable; keep the failure quiet and avoid a broken-looking UI.
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    loadGitHubContributions()
      .then((data) => {
        if (active) setContributionState({ status: "ready", data });
      })
      .catch(() => {
        if (active) setContributionState({ status: "error", data: null });
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <Reveal className="box github-activity" index={1}>
      <div className="section-heading-row">
        <div>
          <span className="mono-label accent">GITHUB ACTIVITY</span>
          <h2>GitHub activity</h2>
        </div>
        <span className={`signal-state${loading ? " is-loading" : ""}`}>
          <span className="signal-dot" aria-hidden="true" />
          {loading ? "Syncing" : stats.source === "profile-links" ? "Profiles linked" : "Synced"}
        </span>
      </div>
      <p className="github-intro">
        I keep two public GitHub identities. This view puts their public work in one place: repos,
        stars, followers, and the contribution history behind the projects.
      </p>
      <div className="github-metrics" aria-label="Combined GitHub metrics">
        <div className="github-metric">
          <span className="stat-value">{displayNumber(stats.totals.public_repos)}</span>
          <span className="mono-label">PUBLIC REPOS</span>
        </div>
        <div className="github-metric">
          <span className="stat-value">{displayNumber(stats.totals.stars)}</span>
          <span className="mono-label">REPO STARS</span>
        </div>
        <div className="github-metric">
          <span className="stat-value">{displayNumber(stats.totals.followers)}</span>
          <span className="mono-label">FOLLOWERS</span>
        </div>
      </div>
      <ContributionHeatmap state={contributionState} />
      <div className="github-accounts">
        {stats.accounts.map((account) => (
          <motion.a
            className="github-account"
            href={account.href}
            target="_blank"
            rel="noreferrer"
            key={account.login}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
          >
            {account.avatar_url ? (
              <img src={account.avatar_url} alt="" className="github-avatar" />
            ) : (
              <span className="github-avatar github-avatar-fallback" aria-hidden="true">
                {account.login.slice(0, 1)}
              </span>
            )}
            <span className="github-account-copy">
              <strong>{account.name || account.login}</strong>
              <span>@{account.login}</span>
            </span>
            <span className="github-arrow" aria-hidden="true">
              ↗
            </span>
          </motion.a>
        ))}
      </div>
    </Reveal>
  );
}
