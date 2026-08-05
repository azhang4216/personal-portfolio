import { useEffect, useMemo, useState } from "react";
import { ArrowIcon, GitHubIcon, SearchIcon } from "./PortfolioIcons";
import { FEATURED_PROJECTS, LINKS, PROJECT_FILTERS } from "../data/portfolio";

const GITHUB_API = "https://api.github.com";
const USERNAME = "azhang4216";

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

function buildActivity(events) {
  const today = new Date();
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 90 - start.getDay());
  const counts = new Map();

  events.forEach((event) => {
    const key = event.created_at?.slice(0, 10);
    if (key) counts.set(key, (counts.get(key) || 0) + 1);
  });

  return Array.from({ length: 98 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const key = date.toISOString().slice(0, 10);
    return { date: key, count: counts.get(key) || 0 };
  });
}

function GitHubActivity({ profile, events, loading }) {
  const activity = useMemo(() => buildActivity(events), [events]);
  const eventCount = events.length;
  const latestEvents = events.slice(0, 3);

  return (
    <div className="github-panel">
      <div className="github-proof">
        <div>
          <span className="section-kicker">Live from GitHub</span>
          <h3>Building in public.</h3>
        </div>
        <div className="github-stats" aria-label="Public GitHub statistics">
          <p><strong>{loading ? "—" : profile?.public_repos ?? "35+"}</strong><span>public repos</span></p>
          <p><strong>{loading ? "—" : eventCount}</strong><span>recent public events</span></p>
        </div>
      </div>
      <div className="activity-grid" aria-label="Recent public GitHub activity by day">
        {activity.map(({ date, count }) => <i key={date} data-level={Math.min(count, 4)} title={`${date}: ${count} public event${count === 1 ? "" : "s"}`} />)}
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

export function ProjectShowcase() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [repos, setRepos] = useState([]);
  const [events, setEvents] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === "test" || typeof fetch !== "function") {
      setLoading(false);
      return undefined;
    }
    const controller = new AbortController();
    const headers = { Accept: "application/vnd.github+json" };

    Promise.all([
      fetch(`${GITHUB_API}/users/${USERNAME}`, { headers, signal: controller.signal }).then((response) => response.ok ? response.json() : null),
      fetch(`${GITHUB_API}/users/${USERNAME}/repos?per_page=100&sort=pushed`, { headers, signal: controller.signal }).then((response) => response.ok ? response.json() : []),
      fetch(`${GITHUB_API}/users/${USERNAME}/events/public?per_page=100`, { headers, signal: controller.signal }).then((response) => response.ok ? response.json() : []),
    ]).then(([profileData, repoData, eventData]) => {
      setProfile(profileData);
      setRepos(repoData.filter((repo) => !repo.fork && !repo.archived).map(normalizeRepo));
      setEvents(eventData);
      setLoading(false);
    }).catch((error) => {
      if (error.name !== "AbortError") setLoading(false);
    });

    return () => controller.abort();
  }, []);

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
          <div><span className="section-kicker">Selected work</span><h2>Proof, not promises.</h2></div>
          <p>Products, infrastructure, research, and tools—each built to make a complex thing feel usefully simple.</p>
        </div>

        <GitHubActivity profile={profile} events={events} loading={loading} />

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
