# Portfolio scheduling API

This is the private calendar boundary for `angela-zhang.org`. The React site asks it for available timestamps; only this service can access Google Calendar.

It deliberately never returns calendar IDs, raw busy ranges, event names, descriptions, or attendees. Bookings support only 15- and 30-minute windows and are rechecked immediately before the event is created.

## Google setup

1. In the Google Cloud project owned by Pier, enable the Google Calendar API.
2. Configure the OAuth audience as **Internal** if `pier-finance.com` is on Google Workspace. This avoids the seven-day refresh-token lifetime applied to external apps left in testing.
3. Create a Web application OAuth client. Add `http://localhost:8787/oauth/callback` as an authorized redirect URI.
4. In Google Calendar while signed in as `angela@pier-finance.com`, create a secondary calendar named **Portfolio bookings**. Its calendar ID becomes `GOOGLE_BOOKING_CALENDAR_ID`.
5. Share each of the three calendars with `angela@pier-finance.com` using **See only free/busy (hide details)**. Put their comma-separated calendar IDs in `GOOGLE_FREEBUSY_CALENDAR_IDS`.
6. Get a one-time refresh token locally:

   ```bash
   cd scheduler-api
   GOOGLE_OAUTH_CLIENT_ID="..." GOOGLE_OAUTH_CLIENT_SECRET="..." npm run oauth
   ```

   Open the printed URL as `angela@pier-finance.com` and copy the refresh token straight into Render.

The OAuth scopes are limited to free/busy reads and events on calendars Angela owns:

- `calendar.freebusy`
- `calendar.events.owned`

Because the event is created on the secondary booking calendar and Angela is invited as an attendee, the invitation can be accepted or declined from Google Calendar. The booking calendar is also checked as busy, so pending requests reserve their slot. The API reconciles responses before availability checks: an acceptance confirms the organizer event, while a decline cancels it with `sendUpdates=all`, notifies the visitor, and reopens the slot.

## Local development

Copy `.env.example` to `.env` and fill the private values. The development script loads that ignored file with Node’s built-in environment-file support.

```bash
npm install
npm test
npm run dev
```

The service listens on `PORT` or `8787` and exposes:

- `GET /v1/health`
- `GET /v1/availability?duration=15&timeZone=America%2FVancouver`
- `POST /v1/book`

## Render

The root `render.yaml` defines a Render Web Service with `scheduler-api` as its root directory. After creating the service, add every environment value marked `sync: false` in the Render dashboard. Never commit those values.

After Render provides the service URL, set this on the React build:

```text
REACT_APP_SCHEDULING_API_URL=https://your-service.onrender.com
```

The Blueprint explicitly uses Render's always-on Starter plan so the first availability request does not cold-start.
