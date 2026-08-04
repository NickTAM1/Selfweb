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
  return String(import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
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

function displayNumber(value) {
  return typeof value === "number" ? value.toLocaleString() : "—";
}

export default function GitHubActivity() {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(true);

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

    return () => {
      active = false;
    };
  }, []);

  return (
    <Reveal className="box github-activity" index={1}>
      <div className="section-heading-row">
        <div>
          <span className="mono-label accent">LIVE_SIGNAL</span>
          <h2>GitHub activity</h2>
        </div>
        <span className={`signal-state${loading ? " is-loading" : ""}`}>
          <span className="signal-dot" aria-hidden="true" />
          {loading ? "Syncing" : stats.source === "profile-links" ? "Profiles linked" : "Synced"}
        </span>
      </div>
      <p className="github-intro">
        Two public identities, one place to follow the work. Repo stars are included when the
        optional Python service is connected.
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
