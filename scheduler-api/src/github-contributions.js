import { load } from "cheerio";

const CONTRIBUTIONS_URL = "https://github.com/users/azhang4216/contributions";
const CACHE_TTL_MS = 30 * 60_000;
let cache = null;

function numericText(value) {
  const match = String(value || "").replace(/,/g, "").match(/\d+/);
  return match ? Number(match[0]) : 0;
}

export function parseGitHubContributions(html, { minimumDays = 350 } = {}) {
  const $ = load(html);
  const container = $(".js-yearly-contributions").first();
  const graph = container.find(".js-calendar-graph").first();
  const heading = container.find("#js-contribution-activity-description").text();
  const totalContributions = numericText(heading);
  const days = [];
  const tooltips = new Map();

  graph.find("tool-tip[for]").each((_index, element) => {
    const tooltip = $(element);
    tooltips.set(tooltip.attr("for"), tooltip.text().trim());
  });

  graph.find("td.ContributionCalendar-day[data-date][data-level]").each((_index, element) => {
    const cell = $(element);
    const date = cell.attr("data-date") || "";
    const level = Number(cell.attr("data-level"));
    const tooltip = tooltips.get(cell.attr("id")) || "";
    const count = /^No contributions\b/i.test(tooltip) ? 0 : numericText(tooltip);

    if (/^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isInteger(level) && level >= 0 && level <= 4) {
      days.push({
        date,
        count,
        level,
        weekday: new Date(`${date}T12:00:00.000Z`).getUTCDay(),
      });
    }
  });

  const uniqueDates = new Set(days.map(({ date }) => date));
  const calculatedTotal = days.reduce((sum, day) => sum + day.count, 0);
  if (
    !totalContributions
    || calculatedTotal !== totalContributions
    || days.length < minimumDays
    || uniqueDates.size !== days.length
  ) {
    throw new Error("GitHub contribution markup was incomplete.");
  }

  return {
    username: "azhang4216",
    from: graph.attr("data-from")?.split(" ")[0] || days[0].date,
    to: graph.attr("data-to")?.split(" ")[0] || days.at(-1).date,
    totalContributions,
    days,
  };
}

async function requestGitHubContributions() {
  const response = await fetch(CONTRIBUTIONS_URL, {
    headers: {
      Accept: "text/html",
      "User-Agent": "angela-portfolio-scheduler",
    },
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) throw new Error(`GitHub returned ${response.status}.`);
  const contentLength = Number(response.headers.get("content-length") || 0);
  if (contentLength > 1_000_000) throw new Error("GitHub contribution response was unexpectedly large.");

  const html = await response.text();
  if (html.length > 1_000_000) throw new Error("GitHub contribution response was unexpectedly large.");
  return parseGitHubContributions(html);
}

export async function getGitHubContributions() {
  const now = Date.now();
  if (cache && cache.expiresAt > now) return { ...cache.data, stale: false };

  try {
    const data = await requestGitHubContributions();
    cache = { data, expiresAt: now + CACHE_TTL_MS };
    return { ...data, stale: false };
  } catch (error) {
    if (cache) return { ...cache.data, stale: true };
    throw error;
  }
}
