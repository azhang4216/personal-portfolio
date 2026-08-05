import test from "node:test";
import assert from "node:assert/strict";
import {
  buildAvailableSlots,
  calendarEventId,
  DEFAULT_WORKING_HOURS,
  isValidTimeZone,
  normalizeBookingPayload,
  slotLockKeys,
} from "../src/scheduling.js";

test("recognizes IANA time zones and rejects invalid values", () => {
  assert.equal(isValidTimeZone("America/Vancouver"), true);
  assert.equal(isValidTimeZone("PST"), false);
  assert.equal(isValidTimeZone("Not/A_Timezone"), false);
});

test("returns only working-hour slots that do not overlap busy time", () => {
  const slots = buildAvailableSlots({
    rangeStart: Date.parse("2026-08-10T15:00:00.000Z"),
    rangeEnd: Date.parse("2026-08-10T20:00:00.000Z"),
    duration: 30,
    busy: [{ start: "2026-08-10T17:00:00.000Z", end: "2026-08-10T18:00:00.000Z" }],
    ownerTimeZone: "America/Vancouver",
    workingHours: DEFAULT_WORKING_HOURS,
    bufferMinutes: 0,
  });
  assert.ok(slots.length > 0);
  assert.equal(slots.some((slot) => slot.start === "2026-08-10T17:00:00.000Z"), false);
  assert.equal(slots.every((slot) => slot.start >= "2026-08-10T16:00:00.000Z"), true);
});

test("creates deterministic Google-compatible event ids", () => {
  const first = calendarEventId("2026-08-10T17:00:00.000Z");
  const second = calendarEventId("2026-08-10T17:00:00.000Z");
  assert.equal(first, second);
  assert.match(first, /^[0-9a-v]{5,1024}$/);
});

test("a 30-minute booking locks both underlying 15-minute cells", () => {
  assert.deepEqual(slotLockKeys("2026-08-10T17:00:00.000Z", 30), [
    "2026-08-10T17:00:00.000Z",
    "2026-08-10T17:15:00.000Z",
  ]);
});

test("normalizes and validates booking input", () => {
  const result = normalizeBookingPayload({
    start: "2026-08-10T17:00:00.000Z",
    duration: 15,
    name: "  Angela Visitor  ",
    email: "Visitor@Example.com",
    timeZone: "America/New_York",
    website: "",
    idempotencyKey: "request-1",
  });
  assert.equal(result.valid, true);
  assert.equal(result.value.email, "visitor@example.com");
  assert.equal(result.value.name, "Angela Visitor");
});

test("rejects malformed timestamps without throwing", () => {
  const result = normalizeBookingPayload({
    start: "not-a-date",
    duration: 15,
    name: "Test Visitor",
    email: "visitor@example.com",
    timeZone: "America/Vancouver",
    idempotencyKey: "request-2",
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.includes("start"));
});
