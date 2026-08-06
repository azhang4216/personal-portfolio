import test from "node:test";
import assert from "node:assert/strict";
import { parseGitHubContributions } from "../src/github-contributions.js";

test("normalizes GitHub contribution cells and their public total", () => {
  const html = `
    <div class="js-yearly-contributions">
      <h2 id="js-contribution-activity-description">950 contributions in the last year</h2>
      <div class="js-calendar-graph" data-from="2025-08-03 00:00:00 UTC" data-to="2026-08-06 23:59:59 UTC">
        <table>
          <td id="day-one" data-date="2026-08-05" data-level="4" class="ContributionCalendar-day"></td>
          <tool-tip for="day-one">950 contributions on August 5th.</tool-tip>
          <td id="day-two" data-date="2026-08-06" data-level="0" class="ContributionCalendar-day"></td>
          <tool-tip for="day-two">No contributions on August 6th.</tool-tip>
        </table>
      </div>
    </div>`;

  const result = parseGitHubContributions(html, { minimumDays: 2 });
  assert.equal(result.totalContributions, 950);
  assert.equal(result.from, "2025-08-03");
  assert.deepEqual(result.days, [
    { date: "2026-08-05", count: 950, level: 4, weekday: 3 },
    { date: "2026-08-06", count: 0, level: 0, weekday: 4 },
  ]);
});
