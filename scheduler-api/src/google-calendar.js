import { randomUUID } from "node:crypto";
import { calendarEventId, mergeBusyCalendars } from "./scheduling.js";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const CALENDAR_API = "https://www.googleapis.com/calendar/v3";

let cachedToken = null;
let cachedTokenExpiresAt = 0;

class GoogleApiError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.name = "GoogleApiError";
    this.status = status;
  }
}

async function responseJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function accessToken(config) {
  if (cachedToken && Date.now() < cachedTokenExpiresAt - 60_000) return cachedToken;

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.googleClientId,
      client_secret: config.googleClientSecret,
      refresh_token: config.googleRefreshToken,
      grant_type: "refresh_token",
    }),
  });
  const data = await responseJson(response);
  if (!response.ok || !data?.access_token) throw new GoogleApiError("Google authorization failed.", 503);

  cachedToken = data.access_token;
  cachedTokenExpiresAt = Date.now() + Number(data.expires_in || 3600) * 1000;
  return cachedToken;
}

async function authorizedFetch(config, url, options) {
  const token = await accessToken(config);
  return fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...(options.headers || {}),
    },
  });
}

export async function getBusyIntervals(config, timeMin, timeMax) {
  const calendarIds = [...config.freeBusyCalendarIds, config.bookingCalendarId];
  const response = await authorizedFetch(config, `${CALENDAR_API}/freeBusy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      timeMin: new Date(timeMin).toISOString(),
      timeMax: new Date(timeMax).toISOString(),
      timeZone: "UTC",
      items: calendarIds.map((id) => ({ id })),
    }),
  });
  const data = await responseJson(response);
  if (!response.ok || !data?.calendars) throw new GoogleApiError("Calendar availability is temporarily unavailable.");

  const calendarErrors = Object.values(data.calendars).some((calendar) => calendar?.errors?.length);
  if (calendarErrors) throw new GoogleApiError("One or more calendars could not be checked.", 503);
  return mergeBusyCalendars(data.calendars);
}

export async function createBookingEvent(config, booking) {
  const startMs = Date.parse(booking.start);
  const end = new Date(startMs + booking.duration * 60_000).toISOString();
  const calendarId = encodeURIComponent(config.bookingCalendarId);
  const eventId = calendarEventId(booking.start);
  const response = await authorizedFetch(
    config,
    `${CALENDAR_API}/calendars/${calendarId}/events?conferenceDataVersion=1&sendUpdates=all`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: eventId,
        summary: `Portfolio conversation · ${booking.duration} min`,
        description: `Requested through angela-zhang.org.\n\nVisitor: ${booking.name}\nVisitor timezone: ${booking.timeZone}\n\nAngela: respond Yes or No to this invitation from Google Calendar.`,
        visibility: "private",
        transparency: "opaque",
        status: "tentative",
        guestsCanInviteOthers: false,
        guestsCanModify: false,
        guestsCanSeeOtherGuests: false,
        start: { dateTime: booking.start, timeZone: booking.timeZone },
        end: { dateTime: end, timeZone: booking.timeZone },
        attendees: [
          { email: config.ownerEmail, responseStatus: "needsAction" },
          { email: booking.email, displayName: booking.name, responseStatus: "needsAction" },
        ],
        conferenceData: {
          createRequest: {
            requestId: randomUUID(),
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
        reminders: { useDefault: true },
        extendedProperties: {
          private: {
            source: "portfolio-scheduler",
            requestId: booking.idempotencyKey,
          },
        },
      }),
    },
  );
  const data = await responseJson(response);

  if (response.status === 409) throw new GoogleApiError("That time was just requested by someone else.", 409);
  if (!response.ok || !data?.id) throw new GoogleApiError("The calendar invitation could not be created.");

  return {
    start: booking.start,
    end,
    status: "pending",
    meetLink: data.hangoutLink || null,
  };
}

export async function reconcileBookingResponses(config, timeMin, timeMax) {
  const calendarId = encodeURIComponent(config.bookingCalendarId);
  const query = new URLSearchParams({
    timeMin: new Date(timeMin).toISOString(),
    timeMax: new Date(timeMax).toISOString(),
    singleEvents: "true",
    maxResults: "100",
    privateExtendedProperty: "source=portfolio-scheduler",
  });
  const response = await authorizedFetch(config, `${CALENDAR_API}/calendars/${calendarId}/events?${query}`, { method: "GET" });
  const data = await responseJson(response);
  if (!response.ok || !Array.isArray(data?.items)) throw new GoogleApiError("Booking responses could not be reconciled.");

  let accepted = 0;
  let declined = 0;
  for (const event of data.items) {
    const owner = event.attendees?.find((attendee) => attendee.email?.toLowerCase() === config.ownerEmail.toLowerCase());
    if (!owner || !event.id) continue;

    if (owner.responseStatus === "declined") {
      const deleteResponse = await authorizedFetch(config, `${CALENDAR_API}/calendars/${calendarId}/events/${encodeURIComponent(event.id)}?sendUpdates=all`, { method: "DELETE" });
      if (deleteResponse.ok || deleteResponse.status === 410) declined += 1;
      continue;
    }

    if (owner.responseStatus === "accepted" && event.status === "tentative") {
      const patchResponse = await authorizedFetch(config, `${CALENDAR_API}/calendars/${calendarId}/events/${encodeURIComponent(event.id)}?sendUpdates=all`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "confirmed" }),
      });
      if (patchResponse.ok) accepted += 1;
    }
  }

  return { accepted, declined };
}

export { GoogleApiError };
