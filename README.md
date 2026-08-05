# Angela Zhang — Portfolio

A recruiter-focused portfolio for [angela-zhang.org](https://angela-zhang.org): an animated code-native landing, career scorecard, searchable project archive with live public GitHub activity, and a private Google Calendar scheduling flow.

## Architecture

- `src/` — React single-page portfolio deployed as a static site.
- `scheduler-api/` — standalone Node/Express scheduling service intended for Render.
- `render.yaml` — Render Blueprint for the scheduling service.

Google credentials never enter the React bundle. The browser receives only available timestamps; raw busy ranges, calendar IDs, and event details remain inside the scheduling API.

## Run the portfolio

```bash
npm install
npm start
```

To connect the local scheduler, copy `.env.example` to `.env.local` and set:

```text
REACT_APP_SCHEDULING_API_URL=http://localhost:8787
```

Before publishing to GitHub Pages, put the deployed Render URL in the ignored `.env.production.local` file:

```text
REACT_APP_SCHEDULING_API_URL=https://your-service.onrender.com
```

## Run the scheduling API

See [scheduler-api/README.md](scheduler-api/README.md) for the Google OAuth, three-calendar free/busy, secondary booking calendar, and Render setup.

```bash
cd scheduler-api
npm install
npm test
npm run dev
```

## Verify and build

```bash
CI=true npm test -- --watchAll=false
npm run build
```

The static build is written to `build/`. The existing `npm run deploy` script publishes it to GitHub Pages.
