export const LINKS = {
  linkedin: "https://www.linkedin.com/in/angela-zl-zhang/",
  github: "https://github.com/azhang4216",
  email: "mailto:angela@pier-finance.com",
};

export const ROLES = [
  "AI systems architect",
  "Customer-facing engineer",
  "Full-stack product builder",
  "Technical leader",
];

export const EXPERIENCE = [
  {
    company: "Pier",
    href: "https://www.pier-finance.com/",
    role: "Chief Technology Officer",
    period: "2026 — now",
    note: "Building data intelligence and multi-agent systems for modern credit and compliance teams.",
    current: true,
  },
  {
    company: "Cohere",
    href: "https://cohere.com/",
    role: "Technical Staff",
    period: "2025",
    note: "Built training data infrastructure and checkpoint systems for frontier AI workloads.",
  },
  {
    company: "Palantir",
    href: "https://www.palantir.com/",
    role: "Forward Deployed Engineer",
    period: "2024",
    note: "Shipped a client-approved supply-chain risk MVP in 14 days and surfaced $3.1M in potential annual compute savings.",
  },
  {
    company: "AWS",
    href: "https://aws.amazon.com/lambda/",
    role: "Software Engineer · Lambda",
    period: "2023",
    note: "Built an asynchronous artifact-merging service that reduced API response time by 10×.",
  },
];

export const FEATURED_PROJECTS = [
  {
    name: "Verse",
    slug: "learn-language-with-song",
    href: "https://github.com/azhang4216/learn-language-with-song",
    category: "Full-stack",
    tags: ["TypeScript", "React", "Postgres"],
    summary: "Learn Mandarin through the music you already love.",
    detail: "Synchronized YouTube lyrics, pinyin and English translations, saved vocabulary, and persistent flashcard review.",
    signal: "01 / LANGUAGE LEARNING",
    visual: "lyrics",
  },
  {
    name: "xlsx-drive-mcp",
    slug: "xlsx-drive-mcp",
    href: "https://github.com/azhang4216/xlsx-drive-mcp",
    category: "AI & agents",
    tags: ["Python", "MCP", "Google Drive"],
    summary: "A spreadsheet-native tool layer for AI agents.",
    detail: "Reads and writes Drive-hosted Excel files with formulas, formatting, charts, and concurrent-edit conflict detection.",
    signal: "02 / AGENT INFRASTRUCTURE",
    visual: "cells",
  },
  {
    name: "Potatunes",
    slug: "spotify-apple-music-blender",
    href: "https://github.com/azhang4216/spotify-apple-music-blender",
    liveHref: "https://potatunes.app/",
    category: "Full-stack",
    tags: ["Cloudflare", "D1", "MusicKit"],
    summary: "Find the overlap between Spotify and Apple Music.",
    detail: "Cross-platform matching, mash playlists, CSV exports, secure PKCE auth, and deterministic ISRC/fuzzy matching.",
    signal: "03 / CONSUMER PRODUCT",
    visual: "waves",
  },
  {
    name: "AngeClaudeBar",
    slug: "angeclaudebar",
    href: "https://github.com/azhang4216/angeclaudebar",
    category: "Developer tools",
    tags: ["Shell", "Claude Code", "DX"],
    summary: "The Claude Code status line I wanted to use every day.",
    detail: "A compact, adaptive view of model, context, Git state, rate limits, cost, and concurrency-safe cached data.",
    signal: "04 / DEVELOPER EXPERIENCE",
    visual: "terminal",
  },
  {
    name: "Pine Beetle Predictor",
    slug: "pine-beetle-frontend",
    href: "https://github.com/dali-lab/pine-beetle-frontend",
    liveHref: "https://spbpredict.com/",
    category: "Data & ML",
    tags: ["React", "Mapbox", "ML"],
    summary: "Turn forest data into decisions for outbreak response.",
    detail: "A DALI Lab and U.S. Forest Service collaboration; pipeline work cut prediction time from eight minutes to under 20 seconds.",
    signal: "05 / CLIMATE DATA",
    visual: "map",
  },
  {
    name: "Divisions of Wealth",
    slug: "divisions-of-wealth",
    href: "https://github.com/azhang4216/divisions-of-wealth",
    category: "Research",
    tags: ["R", "Qualtrics", "Statistics"],
    summary: "Researching how people reason about economic inequality.",
    detail: "A ten-week statistical research project designed with Qualtrics and analyzed in R under Professor Michael Herron.",
    signal: "06 / QUANTITATIVE RESEARCH",
    visual: "bars",
  },
];

export const PROJECT_FILTERS = [
  "All",
  "AI & agents",
  "Full-stack",
  "Developer tools",
  "Data & ML",
  "Research",
];
