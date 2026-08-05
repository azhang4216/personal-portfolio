import { createHash } from "node:crypto";

export const ALLOWED_DURATIONS = new Set([15, 30]);
export const SLOT_INTERVAL_MINUTES = 15;

const WEEKDAY_INDEX = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export const DEFAULT_WORKING_HOURS = {
  1: [["09:00", "17:00"]],
  2: [["09:00", "17:00"]],
  3: [["09:00", "17:00"]],
  4: [["09:00", "17:00"]],
  5: [["09:00", "16:00"]],
};

export function isValidTimeZone(timeZone) {
  if (typeof timeZone !== "string" || timeZone.length > 80 || (timeZone !== "UTC" && !timeZone.includes("/"))) return false;
  try {
    new Intl.DateTimeFormat("en", { timeZone }).format();
    return true;
  } catch {
    return false;
  }
}

export function parseWorkingHours(value) {
  if (!value) return DEFAULT_WORKING_HOURS;
  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== "object") return DEFAULT_WORKING_HOURS;
    return parsed;
  } catch {
    return DEFAULT_WORKING_HOURS;
  }
}

function minutesFromClock(value) {
  const match = /^(\d{2}):(\d{2})$/.exec(value || "");
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function localParts(timestamp, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(timestamp));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    weekday: WEEKDAY_INDEX[values.weekday],
    date: `${values.year}-${values.month}-${values.day}`,
    minute: (Number(values.hour) % 24) * 60 + Number(values.minute),
  };
}

function isInsideWorkingHours(start, end, workingHours, ownerTimeZone) {
  const startLocal = localParts(start, ownerTimeZone);
  const endLocal = localParts(end, ownerTimeZone);
  if (startLocal.date !== endLocal.date) return false;

  const periods = workingHours[startLocal.weekday] || [];
  return periods.some(([periodStart, periodEnd]) => {
    const startMinute = minutesFromClock(periodStart);
    const endMinute = minutesFromClock(periodEnd);
    return startMinute !== null && endMinute !== null && startLocal.minute >= startMinute && endLocal.minute <= endMinute;
  });
}

function overlapsBusy(start, end, busy, bufferMs) {
  return busy.some((interval) => {
    const busyStart = Date.parse(interval.start) - bufferMs;
    const busyEnd = Date.parse(interval.end) + bufferMs;
    return Number.isFinite(busyStart) && Number.isFinite(busyEnd) && start < busyEnd && end > busyStart;
  });
}

function roundUp(timestamp, intervalMs) {
  return Math.ceil(timestamp / intervalMs) * intervalMs;
}

export function buildAvailableSlots({
  rangeStart,
  rangeEnd,
  duration,
  busy,
  ownerTimeZone,
  workingHours,
  bufferMinutes,
  maximumSlots = 240,
}) {
  if (!ALLOWED_DURATIONS.has(duration)) return [];

  const intervalMs = SLOT_INTERVAL_MINUTES * 60_000;
  const durationMs = duration * 60_000;
  const bufferMs = bufferMinutes * 60_000;
  const slots = [];

  for (let start = roundUp(rangeStart, intervalMs); start + durationMs <= rangeEnd; start += intervalMs) {
    const end = start + durationMs;
    if (!isInsideWorkingHours(start, end, workingHours, ownerTimeZone)) continue;
    if (overlapsBusy(start, end, busy, bufferMs)) continue;
    slots.push({ start: new Date(start).toISOString(), end: new Date(end).toISOString() });
    if (slots.length >= maximumSlots) break;
  }

  return slots;
}

export function mergeBusyCalendars(calendars) {
  return Object.values(calendars || {}).flatMap((calendar) => Array.isArray(calendar?.busy) ? calendar.busy : []);
}

export function slotLockKeys(start, duration) {
  const startMs = Date.parse(start);
  if (!Number.isFinite(startMs) || !ALLOWED_DURATIONS.has(duration)) return [];
  const intervalMs = SLOT_INTERVAL_MINUTES * 60_000;
  return Array.from({ length: duration / SLOT_INTERVAL_MINUTES }, (_, index) => new Date(startMs + index * intervalMs).toISOString());
}

export function calendarEventId(start) {
  const digest = createHash("sha256").update(start).digest();
  const alphabet = "0123456789abcdefghijklmnopqrstuv";
  let bits = 0;
  let value = 0;
  let encoded = "";

  for (const byte of digest) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      encoded += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) encoded += alphabet[(value << (5 - bits)) & 31];
  return `b${encoded.slice(0, 51)}`;
}

export function normalizeBookingPayload(body) {
  const duration = Number(body?.duration);
  const start = typeof body?.start === "string" ? body.start : "";
  const name = typeof body?.name === "string" ? body.name.trim().replace(/[\u0000-\u001f\u007f]/g, "") : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const timeZone = typeof body?.timeZone === "string" ? body.timeZone : "";
  const website = typeof body?.website === "string" ? body.website.trim() : "";
  const idempotencyKey = typeof body?.idempotencyKey === "string" ? body.idempotencyKey.slice(0, 160) : "";
  const startMs = Date.parse(start);
  const normalizedStart = Number.isFinite(startMs) ? new Date(startMs).toISOString() : "";

  const errors = [];
  if (!ALLOWED_DURATIONS.has(duration)) errors.push("duration");
  if (!Number.isFinite(startMs) || startMs % (SLOT_INTERVAL_MINUTES * 60_000) !== 0) errors.push("start");
  if (name.length < 2 || name.length > 80) errors.push("name");
  if (email.length > 160 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.push("email");
  if (!isValidTimeZone(timeZone)) errors.push("timeZone");
  if (!idempotencyKey) errors.push("idempotencyKey");

  return {
    valid: errors.length === 0,
    errors,
    value: { duration, start: normalizedStart, name, email, timeZone, website, idempotencyKey },
  };
}
