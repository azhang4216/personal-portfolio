import express from "express";
import helmet from "helmet";
import { ipKeyGenerator, rateLimit } from "express-rate-limit";
import { createBookingEvent, getBusyIntervals, GoogleApiError, reconcileBookingResponses } from "./google-calendar.js";
import {
  ALLOWED_DURATIONS,
  buildAvailableSlots,
  isValidTimeZone,
  normalizeBookingPayload,
  parseWorkingHours,
  slotLockKeys,
} from "./scheduling.js";

const numberFromEnv = (name, fallback) => {
  const value = Number(process.env[name]);
  return Number.isFinite(value) ? value : fallback;
};

const config = {
  port: numberFromEnv("PORT", 8787),
  allowedOrigins: new Set((process.env.ALLOWED_ORIGINS || "http://localhost:3000,https://angela-zhang.org,https://www.angela-zhang.org").split(",").map((value) => value.trim()).filter(Boolean)),
  ownerEmail: process.env.BOOKING_OWNER_EMAIL || "angela@pier-finance.com",
  ownerTimeZone: process.env.BOOKING_DEFAULT_TIME_ZONE || "America/Vancouver",
  workingHours: parseWorkingHours(process.env.BOOKING_WORKING_HOURS_JSON),
  minNoticeMinutes: numberFromEnv("BOOKING_MIN_NOTICE_MINUTES", 120),
  maxAdvanceDays: numberFromEnv("BOOKING_MAX_ADVANCE_DAYS", 21),
  bufferMinutes: numberFromEnv("BOOKING_BUFFER_MINUTES", 15),
  googleClientId: process.env.GOOGLE_OAUTH_CLIENT_ID || "",
  googleClientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET || "",
  googleRefreshToken: process.env.GOOGLE_OAUTH_REFRESH_TOKEN || "",
  bookingCalendarId: process.env.GOOGLE_BOOKING_CALENDAR_ID || "",
  freeBusyCalendarIds: (process.env.GOOGLE_FREEBUSY_CALENDAR_IDS || "").split(",").map((value) => value.trim()).filter(Boolean),
};

const requiredCalendarConfig = [
  config.googleClientId,
  config.googleClientSecret,
  config.googleRefreshToken,
  config.bookingCalendarId,
  config.freeBusyCalendarIds.length >= 3,
];
const calendarConfigured = requiredCalendarConfig.every(Boolean);

const app = express();
app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(express.json({ limit: "12kb", strict: true }));

app.use((request, response, next) => {
  const origin = request.headers.origin;
  if (origin && config.allowedOrigins.has(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Vary", "Origin");
    response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type,Accept");
    response.setHeader("Access-Control-Max-Age", "86400");
  }

  if (request.method === "OPTIONS") {
    return config.allowedOrigins.has(origin) ? response.sendStatus(204) : response.sendStatus(403);
  }
  if (origin && !config.allowedOrigins.has(origin)) return response.status(403).json({ message: "Origin not allowed." });
  return next();
});

app.get("/v1/health", (_request, response) => {
  response.json({ status: "ok", calendarConfigured });
});

app.use("/v1", rateLimit({
  windowMs: 60_000,
  limit: 60,
  standardHeaders: "draft-8",
  legacyHeaders: false,
}));

const bookingLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: (request) => {
    const email = typeof request.body?.email === "string" ? request.body.email.trim().toLowerCase() : "";
    return email ? `email:${email}` : `ip:${ipKeyGenerator(request.ip)}`;
  },
  message: { message: "Too many booking attempts. Please wait before trying again." },
});

const bookingIpLimiter = rateLimit({
  windowMs: 60 * 60_000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many booking attempts from this network. Please try again later." },
});

const locks = new Map();
let lastReconciledAt = 0;
let reconciliationPromise = null;

async function withLock(key, task) {
  const previous = locks.get(key) || Promise.resolve();
  let release;
  const current = new Promise((resolve) => { release = resolve; });
  locks.set(key, current);
  await previous;
  try {
    return await task();
  } finally {
    release();
    if (locks.get(key) === current) locks.delete(key);
  }
}

function withSlotLocks(keys, task) {
  const ordered = [...new Set(keys)].sort();
  const acquire = (index) => index >= ordered.length ? task() : withLock(ordered[index], () => acquire(index + 1));
  return acquire(0);
}

async function reconcileIfNeeded() {
  if (Date.now() - lastReconciledAt < 60_000) return;
  if (!reconciliationPromise) {
    const now = Date.now();
    reconciliationPromise = reconcileBookingResponses(config, now - 86_400_000, now + config.maxAdvanceDays * 86_400_000)
      .then((result) => {
        lastReconciledAt = Date.now();
        if (result.accepted || result.declined) console.log(JSON.stringify({ message: "booking_responses_reconciled", ...result }));
      })
      .finally(() => { reconciliationPromise = null; });
  }
  await reconciliationPromise;
}

async function availableSlots(duration, rangeStart, rangeEnd) {
  await reconcileIfNeeded();
  const busy = await getBusyIntervals(config, rangeStart - config.bufferMinutes * 60_000, rangeEnd + config.bufferMinutes * 60_000);
  return buildAvailableSlots({
    rangeStart,
    rangeEnd,
    duration,
    busy,
    ownerTimeZone: config.ownerTimeZone,
    workingHours: config.workingHours,
    bufferMinutes: config.bufferMinutes,
  });
}

app.get("/v1/availability", async (request, response, next) => {
  try {
    if (!calendarConfigured) return response.status(503).json({ message: "Calendar setup is incomplete." });
    const duration = Number(request.query.duration || 30);
    const timeZone = typeof request.query.timeZone === "string" ? request.query.timeZone : config.ownerTimeZone;
    if (!ALLOWED_DURATIONS.has(duration) || !isValidTimeZone(timeZone)) return response.status(400).json({ message: "Invalid scheduling options." });

    const now = Date.now();
    const rangeStart = now + config.minNoticeMinutes * 60_000;
    const rangeEnd = now + config.maxAdvanceDays * 86_400_000;
    const slots = await availableSlots(duration, rangeStart, rangeEnd);
    return response.json({ duration, timeZone, slots });
  } catch (error) {
    return next(error);
  }
});

app.post("/v1/book", bookingIpLimiter, bookingLimiter, async (request, response, next) => {
  try {
    if (!calendarConfigured) return response.status(503).json({ message: "Calendar setup is incomplete." });
    const parsed = normalizeBookingPayload(request.body);
    if (!parsed.valid) return response.status(400).json({ message: "Please check the booking details and try again." });
    const booking = parsed.value;

    if (booking.website) {
      const end = new Date(Date.parse(booking.start) + booking.duration * 60_000).toISOString();
      return response.status(202).json({ booking: { start: booking.start, end, status: "pending", meetLink: null } });
    }

    const now = Date.now();
    const startMs = Date.parse(booking.start);
    if (startMs < now + config.minNoticeMinutes * 60_000 || startMs > now + config.maxAdvanceDays * 86_400_000) {
      return response.status(400).json({ message: "That time falls outside the booking window." });
    }

    const lockKeys = slotLockKeys(booking.start, booking.duration);
    const created = await withSlotLocks(lockKeys, async () => {
      const endMs = startMs + booking.duration * 60_000;
      const matchingSlots = await availableSlots(booking.duration, startMs, endMs);
      if (!matchingSlots.some((slot) => slot.start === booking.start)) {
        const error = new Error("That time is no longer available.");
        error.status = 409;
        throw error;
      }
      return createBookingEvent(config, booking);
    });

    return response.status(201).json({ booking: created });
  } catch (error) {
    return next(error);
  }
});

app.use((error, request, response, _next) => {
  const status = error instanceof GoogleApiError ? error.status : Number(error.status) || 500;
  console.error(JSON.stringify({
    message: "scheduler_request_failed",
    method: request.method,
    path: request.path,
    status,
    error: error.name || "Error",
  }));
  const publicMessage = status < 500 ? error.message : "Scheduling is temporarily unavailable. Please try again shortly.";
  response.status(status).json({ message: publicMessage });
});

const server = app.listen(config.port, "0.0.0.0", () => {
  console.log(JSON.stringify({ message: "scheduler_started", port: config.port, calendarConfigured }));
});

if (calendarConfigured) {
  const reconciliationTimer = setInterval(() => {
    reconcileIfNeeded().catch((error) => {
      console.error(JSON.stringify({ message: "booking_reconciliation_failed", error: error.name || "Error" }));
    });
  }, 5 * 60_000);
  reconciliationTimer.unref();
}

process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});
