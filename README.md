# ELD Trip Planner — Web

React app that plans a legal truck trip and draws the driver's daily log sheets. Enter the current location, pickup,
dropoff and current cycle used; get a route map with every required stop plus FMCSA Driver's Daily Logs, one per day.

| | |
|---|---|
| **Live app** | _TBD — https://<app>.vercel.app_ |
| API repo | `https://github.com/<you>/eld-trip-planner-api` (Django + MongoDB on Render) |
| Loom | _TBD_ |

> 🚧 In development — tracker: [`docs/03-implementation-plan.md`](docs/03-implementation-plan.md)

> ℹ️ The API runs on Render's free tier. After ~15 idle minutes the first request can take about a minute; the app shows a
> "waking up the server" banner while that happens.

## Stack

React + Vite + TypeScript · Tailwind + shadcn/ui · TanStack Query · Zustand · axios · react-hook-form + zod · Leaflet + OpenStreetMap ·
Vitest + React Testing Library + MSW · **Playwright** (system E2E, a11y, visual) · Vercel

## Run locally

Needs the API repo checked out next to this one (`../eld-trip-planner-api`) with `MONGODB_URI` (MongoDB Atlas) set in its `.env`.

```bash
npm install
npm run e2e          # boots API (fake geo) + web and runs the full Playwright suite
npm run dev          # or run the web app alone against VITE_API_BASE_URL
```

## Docs

[Definition of done](docs/01-definition-of-done.md) · [Architecture](docs/02-architecture.md) ·
[Implementation plan](docs/03-implementation-plan.md) · [Testing strategy](docs/04-testing-strategy.md) ·
[Getting started](docs/05-getting-started.md) · [Project setup](docs/06-project-setup.md) · Business rules → API repo `docs/01-business-rules.md`
