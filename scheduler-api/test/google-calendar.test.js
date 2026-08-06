import test from "node:test";
import assert from "node:assert/strict";
import { bookingEventPayload } from "../src/google-calendar.js";

test("creates a named 1:1 with a visible two-person guest list", () => {
  const event = bookingEventPayload(
    { ownerEmail: "angela@pier-finance.com" },
    {
      start: "2026-08-10T17:00:00.000Z",
      duration: 30,
      name: "Grace Hopper",
      email: "grace@example.com",
      timeZone: "America/New_York",
      idempotencyKey: "request-3",
    },
  );

  assert.equal(event.summary, "<Angela / Grace Hopper> 1:1");
  assert.equal(event.guestsCanSeeOtherGuests, true);
  assert.deepEqual(event.attendees.map(({ email }) => email), [
    "angela@pier-finance.com",
    "grace@example.com",
  ]);
});
