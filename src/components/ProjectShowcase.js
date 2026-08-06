import { useEffect, useMemo, useState } from "react";
import { ArrowIcon, GitHubIcon, SearchIcon } from "./PortfolioIcons";
import { FEATURED_PROJECTS, LINKS, PROJECT_FILTERS } from "../data/portfolio";

const GITHUB_API = "https://api.github.com";
const PORTFOLIO_API_URL = (process.env.REACT_APP_SCHEDULING_API_URL || "").replace(/\/$/, "");
const USERNAME = "azhang4216";
const CALENDAR_WEEKS = 53;
const DAYS_PER_WEEK = 7;
const CALENDAR_DAYS = CALENDAR_WEEKS * DAYS_PER_WEEK;

const CONTRIBUTION_LEVELS = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

const contributionDateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

const contributionRangeFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function inferCategory(repo) {
  const source = `${repo.name} ${repo.description || ""} ${(repo.topics || []).join(" ")}`.toLowerCase();
  if (/\b(mcp|agent|claude|ai|llm)\b/.test(source)) return "AI & agents";
  if (/\b(cli|tool|status|plugin|extension|developer)\b/.test(source)) return "Developer tools";
  if (/\b(data|model|predict|research|wealth|classifier|ml)\b/.test(source) || ["R", "Jupyter Notebook"].includes(repo.language)) return "Data & ML";
  if (["TypeScript", "JavaScript", "HTML", "Ruby"].includes(repo.language)) return "Full-stack";
  if (/\b(research|study|analysis)\b/.test(source)) return "Research";
  return "Experiments";
}

function normalizeRepo(repo) {
  return {
    name: repo.name,
    slug: repo.name,
    href: repo.html_url,
    liveHref: repo.homepage || "",
    category: inferCategory(repo),
    tags: [repo.language, ...(repo.topics || [])].filter(Boolean).slice(0, 3),
    summary: repo.description || "A public build from Angela’s GitHub archive.",
    detail: "",
    updatedAt: repo.pushed_at,
    archived: repo.archived,
  };
}

function Visual({ type = "terminal" }) {
  return (
    <div className={`project-visual visual-${type}`} aria-hidden="true">
      {type === "lyrics" && <><span>夢を見る</span><span>mèng / to dream</span><i /><i /><i /></>}
      {type === "cells" && Array.from({ length: 20 }, (_, index) => <i key={index}>{index % 5 === 0 ? "fx" : index % 3 === 0 ? "=" : ""}</i>)}
      {type === "waves" && <><b /><b /><b /><b /><span>SPOTIFY × MUSIC</span></>}
      {type === "terminal" && <><span>⟩ model: opus</span><span>⟩ context: 41%</span><span>⟩ branch: main</span><i /></>}
      {type === "map" && <><b /><b /><b /><span>49.2°N / 123.1°W</span></>}
      {type === "bars" && <>{[42, 68, 35, 82, 56, 74, 48].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}<span>n = 1,204</span></>}
    </div>
  );
}

function ProjectCard({ project, compact = false }) {
  return (
    <article className={`project-card ${compact ? "compact" : ""}`}>
      {!compact && <Visual type={project.visual} />}
      <div className="project-card-body">
        <div className="project-card-meta">
          <span>{project.signal || project.category}</span>
          <span>{project.updatedAt ? new Date(project.updatedAt).getFullYear() : "BUILD"}</span>
        </div>
        <h3>{project.name}</h3>
        <p className="project-summary">{project.summary}</p>
        {project.detail && <p className="project-detail">{project.detail}</p>}
        <div className="project-card-footer">
          <div className="project-tags">
            {project.tags.map((tag) => <span key={tag}>{tag}</span>)}
          </div>
          <div className="project-actions">
            {project.liveHref && <a href={project.liveHref} target="_blank" rel="noreferrer" aria-label={`Open ${project.name} live project`}>Live <ArrowIcon diagonal /></a>}
            <a href={project.href} target="_blank" rel="noreferrer" aria-label={`Open ${project.name} source on GitHub`}>Source <ArrowIcon diagonal /></a>
          </div>
        </div>
      </div>
    </article>
  );
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fromDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function normalizeContributionPayload(payload) {
  const payloadIsArray = Array.isArray(payload);
  const rawDays = Array.isArray(payload)
    ? payload
    : payload?.days || payload?.contributions || payload?.data;

  if (!Array.isArray(rawDays)) return null;

  const contributions = rawDays.flatMap((day) => {
    const date = day?.date;
    const rawCount = day?.count ?? day?.contributionCount ?? 0;
    const count = Number(rawCount);
    const rawLevel = day?.level ?? day?.contributionLevel;
    const namedLevel = typeof rawLevel === "string" ? CONTRIBUTION_LEVELS[rawLevel] : undefined;
    const numericLevel = Number.isFinite(Number(rawLevel)) ? Number(rawLevel) : namedLevel;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "") || !Number.isFinite(count)) return [];

    return [{
      date,
      count: Math.max(0, count),
      level: Number.isFinite(numericLevel) ? Math.min(4, Math.max(0, numericLevel)) : null,
    }];
  });

  const calculatedTotal = contributions.reduce((sum, day) => sum + day.count, 0);
  const declaredTotal = Number(payload?.totalContributions ?? payload?.total);
  const hasDeclaredTotal = Number.isFinite(declaredTotal) && declaredTotal >= 0;

  if (!payloadIsArray && (
    contributions.length < 350
    || !hasDeclaredTotal
    || calculatedTotal !== declaredTotal
  )) return null;

  return { contributions, totalContributions: hasDeclaredTotal ? declaredTotal : calculatedTotal };
}

function contributionLevel(count, explicitLevel, positiveCounts) {
  if (count <= 0) return 0;
  if (Number.isFinite(explicitLevel)) return explicitLevel;

  const percentile = (ratio) => positiveCounts[Math.floor((positiveCounts.length - 1) * ratio)] || count;
  if (count <= percentile(0.25)) return 1;
  if (count <= percentile(0.5)) return 2;
  if (count <= percentile(0.75)) return 3;
  return 4;
}

function buildContributionCalendar(contributions) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const calendarEnd = new Date(today);
  calendarEnd.setDate(today.getDate() + (DAYS_PER_WEEK - 1 - today.getDay()));

  const calendarStart = new Date(calendarEnd);
  calendarStart.setDate(calendarEnd.getDate() - (CALENDAR_DAYS - 1));

  const contributionMap = new Map(contributions.map((day) => [day.date, day]));
  const positiveCounts = contributions
    .map((day) => day.count)
    .filter((count) => count > 0)
    .sort((a, b) => a - b);

  const days = Array.from({ length: CALENDAR_DAYS }, (_, index) => {
    const date = new Date(calendarStart);
    date.setDate(calendarStart.getDate() + index);
    const dateKey = toDateKey(date);
    const contribution = contributionMap.get(dateKey);
    const future = date > today;
    const count = future ? 0 : contribution?.count || 0;

    return {
      date: dateKey,
      count,
      future,
      level: future ? 0 : contributionLevel(count, contribution?.level, positiveCounts),
    };
  });

  const monthLabels = [];
  let labelledMonth = "";

  for (let weekIndex = 0; weekIndex < CALENDAR_WEEKS; weekIndex += 1) {
    const week = days.slice(weekIndex * DAYS_PER_WEEK, (weekIndex + 1) * DAYS_PER_WEEK);
    const firstOfMonth = week.find((day) => !day.future && fromDateKey(day.date).getDate() === 1);
    const labelDay = weekIndex === 0 ? week.find((day) => !day.future) : firstOfMonth;

    if (!labelDay) continue;
    const date = fromDateKey(labelDay.date);
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    if (monthKey === labelledMonth) continue;

    monthLabels.push({
      label: date.toLocaleDateString(undefined, { month: "short" }),
      weekIndex,
    });
    labelledMonth = monthKey;
  }

  return {
    days,
    monthLabels: monthLabels.map((label, index) => ({
      ...label,
      span: (monthLabels[index + 1]?.weekIndex || CALENDAR_WEEKS) - label.weekIndex,
    })),
    total: days.reduce((sum, day) => sum + day.count, 0),
    start: calendarStart,
    end: today,
  };
}

function contributionLabel({ date, count }) {
  const formattedDate = contributionDateFormatter.format(fromDateKey(date));
  return count === 0
    ? `No contributions on ${formattedDate}`
    : `${count} contribution${count === 1 ? "" : "s"} on ${formattedDate}`;
}

function GitHubActivity({ profile, events, loading, contributions, contributionStatus }) {
  const calendar = useMemo(() => buildContributionCalendar(contributions), [contributions]);
  const latestEvents = events.slice(0, 3);
  const totalLabel = contributionStatus === "ready" ? calendar.total.toLocaleString() : "—";

  return (
    <div className="github-panel">
      <div className="github-proof">
        <div>
          <h3>Live from GitHub</h3>
        </div>
        <div className="github-stats" aria-label="Public GitHub statistics">
          <p><strong>{loading ? "—" : profile?.public_repos ?? "35+"}</strong><span>public repos</span></p>
          <p><strong>{totalLabel}</strong><span>contributions · last year</span></p>
        </div>
      </div>

      <div className={`contribution-calendar is-${contributionStatus}`} aria-busy={contributionStatus === "loading"}>
        {contributionStatus === "ready" ? <>
          <div className="contribution-calendar-scroll" role="region" aria-label={`${calendar.total.toLocaleString()} GitHub contributions in the last year`} tabIndex="0">
            <div
              className="contribution-months"
              aria-hidden="true"
              style={{ gridTemplateColumns: `32px repeat(${CALENDAR_WEEKS}, minmax(7px, 1fr))` }}
            >
              <span />
              {calendar.monthLabels.map(({ label, weekIndex, span }) => (
                <span key={`${label}-${weekIndex}`} style={{ gridColumn: `${weekIndex + 2} / span ${span}` }}>{label}</span>
              ))}
            </div>
            <div className="contribution-chart">
              <div className="contribution-weekdays" aria-hidden="true">
                <span /><span>Mon</span><span /><span>Wed</span><span /><span>Fri</span><span />
              </div>
              <div
                className="activity-grid"
                role="grid"
                aria-label="GitHub contributions by day"
                aria-rowcount={DAYS_PER_WEEK}
                aria-colcount={CALENDAR_WEEKS}
                style={{ gridTemplateColumns: `repeat(${CALENDAR_WEEKS}, minmax(7px, 1fr))` }}
              >
                {calendar.days.map((day, index) => {
                  const label = contributionLabel(day);
                  return day.future
                    ? <i key={day.date} className="is-future" aria-hidden="true" data-level="0" />
                    : <i
                        key={day.date}
                        role="gridcell"
                        aria-label={label}
                        aria-rowindex={(index % DAYS_PER_WEEK) + 1}
                        aria-colindex={Math.floor(index / DAYS_PER_WEEK) + 1}
                        data-date={day.date}
                        data-count={day.count}
                        data-level={day.level}
                        tabIndex="0"
                        title={label}
                      />;
                })}
              </div>
            </div>
          </div>
          <div className="contribution-calendar-footer">
            <span>{calendar.total.toLocaleString()} contributions from {contributionRangeFormatter.format(calendar.start)} to {contributionRangeFormatter.format(calendar.end)}</span>
            <div className="contribution-legend" aria-label="Contribution intensity: less to more">
              <span>Less</span>
              {[0, 1, 2, 3, 4].map((level) => <i key={level} data-level={level} aria-hidden="true" />)}
              <span>More</span>
            </div>
          </div>
        </> : <p className="contribution-status" role="status">
          {contributionStatus === "loading"
            ? "Loading public contribution history…"
            : "The public contribution calendar is temporarily unavailable."}
        </p>}
      </div>

      <div className="activity-lower">
        <div className="activity-events">
          {latestEvents.length ? latestEvents.map((event) => (
            <a key={event.id} href={`https://github.com/${event.repo.name}`} target="_blank" rel="noreferrer">
              <span>{event.type.replace("Event", "")}</span>
              <strong>{event.repo.name.replace(`${USERNAME}/`, "")}</strong>
              <time>{new Date(event.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</time>
            </a>
          )) : <p className="activity-empty">{loading ? "Loading current activity…" : "GitHub activity is temporarily unavailable."}</p>}
        </div>
        <a className="github-profile-link" href={LINKS.github} target="_blank" rel="noreferrer"><GitHubIcon /> View GitHub profile <ArrowIcon diagonal /></a>
      </div>
    </div>
  );
}

export function ProjectShowcase({ contributionData: suppliedContributionData = null } = {}) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [repos, setRepos] = useState([]);
  const [events, setEvents] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const normalizedSuppliedContributions = useMemo(
    () => normalizeContributionPayload(suppliedContributionData),
    [suppliedContributionData]
  );
  const [contributions, setContributions] = useState(
    () => normalizedSuppliedContributions?.contributions || []
  );
  const [contributionStatus, setContributionStatus] = useState(
    normalizedSuppliedContributions ? "ready" : "loading"
  );
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === "test" || typeof fetch !== "function") {
      setLoading(false);
      setContributionStatus(normalizedSuppliedContributions ? "ready" : "unavailable");
      return undefined;
    }
    const controller = new AbortController();
    const headers = { Accept: "application/vnd.github+json" };

    const contributionRequest = normalizedSuppliedContributions
      ? Promise.resolve(normalizedSuppliedContributions)
      : PORTFOLIO_API_URL
        ? fetch(`${PORTFOLIO_API_URL}/v1/github/contributions?v=2`, {
            cache: "no-store",
            headers: { Accept: "application/json" },
            signal: controller.signal,
          })
          .then((response) => response.ok ? response.json() : null)
          .then(normalizeContributionPayload)
        : Promise.resolve(null);

    Promise.allSettled([
      fetch(`${GITHUB_API}/users/${USERNAME}`, { headers, signal: controller.signal }).then((response) => response.ok ? response.json() : null),
      fetch(`${GITHUB_API}/users/${USERNAME}/repos?per_page=100&sort=pushed`, { headers, signal: controller.signal }).then((response) => response.ok ? response.json() : []),
      fetch(`${GITHUB_API}/users/${USERNAME}/events/public?per_page=100`, { headers, signal: controller.signal }).then((response) => response.ok ? response.json() : []),
      contributionRequest,
    ]).then(([profileResult, repoResult, eventResult, contributionResult]) => {
      if (controller.signal.aborted) return;

      const profileData = profileResult.status === "fulfilled" ? profileResult.value : null;
      const repoData = repoResult.status === "fulfilled" && Array.isArray(repoResult.value) ? repoResult.value : [];
      const eventData = eventResult.status === "fulfilled" && Array.isArray(eventResult.value) ? eventResult.value : [];
      const contributionData = contributionResult.status === "fulfilled" ? contributionResult.value : null;

      setProfile(profileData);
      setRepos(repoData.filter((repo) => !repo.fork && !repo.archived).map(normalizeRepo));
      setEvents(eventData);
      if (contributionData) {
        setContributions(contributionData.contributions);
        setContributionStatus("ready");
      } else {
        setContributionStatus("unavailable");
      }
      setLoading(false);
    }).catch((error) => {
      if (error.name !== "AbortError") {
        setLoading(false);
        setContributionStatus("unavailable");
      }
    });

    return () => controller.abort();
  }, [normalizedSuppliedContributions]);

  const allProjects = useMemo(() => {
    const featuredSlugs = new Set(FEATURED_PROJECTS.map((project) => project.slug));
    return [...FEATURED_PROJECTS, ...repos.filter((repo) => !featuredSlugs.has(repo.slug))];
  }, [repos]);

  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return allProjects.filter((project) => {
      const matchesFilter = activeFilter === "All" || project.category === activeFilter;
      const haystack = `${project.name} ${project.summary} ${project.detail || ""} ${project.category} ${project.tags.join(" ")}`.toLowerCase();
      return matchesFilter && (!normalizedQuery || haystack.includes(normalizedQuery));
    });
  }, [activeFilter, allProjects, query]);

  const featuredResults = filteredProjects.filter((project) => FEATURED_PROJECTS.some((featured) => featured.slug === project.slug));
  const archiveResults = filteredProjects.filter((project) => !FEATURED_PROJECTS.some((featured) => featured.slug === project.slug));
  const visibleArchive = showAll ? archiveResults : archiveResults.slice(0, 6);

  return (
    <section className="projects-section" id="projects">
      <div className="site-container">
        <div className="section-heading projects-heading">
          <div><h2>Selected Work</h2></div>
          <p>Products, infrastructure, research, and tools, all open source.</p>
        </div>

        <GitHubActivity
          profile={profile}
          events={events}
          loading={loading}
          contributions={contributions}
          contributionStatus={contributionStatus}
        />

        <div className="project-controls">
          <label className="project-search">
            <SearchIcon />
            <span className="sr-only">Search projects</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by project, technology, or problem" />
          </label>
          <div className="project-filters" aria-label="Filter projects">
            {[...PROJECT_FILTERS, "Experiments"].map((filter) => (
              <button key={filter} type="button" className={activeFilter === filter ? "active" : ""} onClick={() => setActiveFilter(filter)}>{filter}</button>
            ))}
          </div>
        </div>

        {featuredResults.length > 0 && <div className="featured-project-grid">
          {featuredResults.map((project) => <ProjectCard key={project.slug} project={project} />)}
        </div>}

        {archiveResults.length > 0 && <div className="archive-wrap">
          <div className="archive-heading"><h3>More from the archive</h3><span>{archiveResults.length} public build{archiveResults.length === 1 ? "" : "s"}</span></div>
          <div className="archive-grid">{visibleArchive.map((project) => <ProjectCard key={project.slug} project={project} compact />)}</div>
          {archiveResults.length > 6 && <button className="show-all-button" type="button" onClick={() => setShowAll((value) => !value)}>{showAll ? "Show less" : `Show all ${archiveResults.length}`} <span aria-hidden="true">{showAll ? "↑" : "↓"}</span></button>}
        </div>}

        {!loading && filteredProjects.length === 0 && <div className="project-empty"><p>No projects match that search yet.</p><button type="button" onClick={() => { setQuery(""); setActiveFilter("All"); }}>Clear filters</button></div>}
      </div>
    </section>
  );
}
