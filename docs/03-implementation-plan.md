# 03 — Implementation Plan & Status Tracker (system overview + web)

> - Task IDs: `W<phase>-<nn>` (this repo) and `A<phase>-<nn>` (API repo, tracked in `eld-trip-planner-api/docs/03-implementation-plan.md`).
> - Commit with the task ID; update **Status** in the same commit. Keep the **system overview** below in sync
>   whenever a phase changes state in either repo.
> - **No feature work (A2+, W6+) until W1 (Playwright) and A1 are ✅.**

**Status:** ⬜ Not started · 🟨 In progress · ✅ Done · ⛔ Blocked · ⏭️ Deferred (stretch)

---

## System progress overview (both repos)

| Order | Phase | Repo | Name | Est. | Status | Gate |
|---|---|---|---|---|---|---|
| 1 | **A0** | api | Foundation + Render health deploy | 0.5 d | ✅ | `/api/health/` green locally and on Render (CI deferred) |
| 1 | **W0** | web | Foundation + Vercel shell deploy | 0.5 d | 🟨 | Shell green locally and on Vercel (CI deferred) |
| 2 | **W1** | web | **Playwright harness + all acceptance specs** | 0.5 d | 🟨 | `harness.spec.ts` green; every AC has a `fixme` spec (CI deferred) |
| 2 | **A1** | api | Acceptance tests (pytest, skipped) | 0.25 d | ✅ | SC-1…SC-7 collected |
| 3 | A2 | api | HOS engine | 1 d | ⬜ | Goldens + property tests |
| 4 | A3 | api | Log builder | 0.5 d | ⬜ | John Doe golden; logs total 24 |
| 5 | A4 | api | Geo services | 0.5 d | ⬜ | Adapters + fake provider |
| 6 | A5 | api | API, persistence, contract | 0.75 d | ⬜ | Acceptance green + web `api-contract.spec.ts` green |
| 6 | W5 | web | Contract sync | 0.25 d | ⬜ | Generated types + synced fixtures committed |
| 7 | W6 | web | Trip form + server status | 0.5 d | ✅ | `trip-form.spec.ts` green |
| 8 | W7 | web | Map, stops, summary, share link | 0.75 d | ✅ | `route-map`, `share-link` green |
| 9 | W8 | web | Daily log sheets | 1 d | ✅ | `log-sheets`, `hos-scenarios` green |
| 10 | W9 | web | UX polish, errors, cold start, responsive, a11y | 0.5 d | ✅ | `cold-start`, `errors`, `responsive`, `a11y` green |
| 11 | A10 + W10 | both | Production (Render live providers + Vercel) + smoke | 0.5 d | ⬜ | `@smoke` green in production |
| 12 | A11 + W11 | both | READMEs, Loom, submit | 0.5 d | ⬜ | Submitted |

**≈ 7–7.5 working days.** Cut order if short on time: W9 ⏭️ items → W7 share link → stretch tasks.
Never cut W1, A2, A3, W8.

---

## W0 — Foundation

| ID | Task | Test first | Status |
|---|---|---|---|
| W0-01 | Create GitHub repo `eld-trip-planner-web` (public); add `CLAUDE.md`, `README.md`, `docs/` | — | ✅ |
| W0-02 | Per `06-project-setup.md`: Vite React-TS; Tailwind v4; `@/` alias; shadcn/ui init + components; react-router, TanStack Query, Zustand, axios, react-hook-form + zod, react-leaflet, date-fns; Vitest + RTL + MSW; scripts | `src/App.test.tsx` renders | ✅ |
| W0-03 | App shell: providers, router, header "ELD Trip Planner", empty planner layout; axios `lib/api/client.ts` (base URL, 90 s timeout, error normalization); `stores/ui-store.ts` | `App.test.tsx` heading; `client.test.ts` error normalization | ✅ |
| W0-04 | `vercel.json` SPA rewrite | — | ⬜ |
| W0-05 | CI `unit` job: lint, typecheck, vitest | push → green | ⏭️ |
| W0-06 | Vercel project from repo; `VITE_API_BASE_URL` = Render URL (from A0-08) | open the Vercel URL → shell renders | ⬜ |

**Gate:** shell renders locally and on Vercel. CI is ⏭️ deferred (see *Decision log*).

## W1 — Playwright harness + acceptance specs — **must finish before feature work**

Requires A0 (health endpoint + fake provider switch).

| ID | Task | Test first | Status |
|---|---|---|---|
| W1-01 | Install `@playwright/test`, `@axe-core/playwright`, `openapi-typescript`; `npx playwright install chromium`; scripts `e2e`, `e2e:ui` | — | ✅ |
| W1-02 | `e2e/playwright.config.ts` per `04-testing-strategy.md` §6 (boots sibling API via `API_DIR` + Vite; desktop + mobile; smoke mode) | — | ✅ |
| W1-03 | `harness.spec.ts`: shell loads + API health ok | red until wiring works → green | ✅ |
| W1-04 | Page objects `PlannerPage`, `ResultsPage`, `LogSheetsPage` (selectors from the test-ID contract) | — | ✅ |
| W1-05 | `e2e/fixtures/scenarios.ts` (SC-1…SC-7 inputs + expectations) | — | ✅ |
| W1-06 | All acceptance specs as `test.fixme`, one test per AC: `api-contract`, `trip-form`, `route-map`, `share-link`, `log-sheets`, `hos-scenarios`, `cold-start`, `errors`, `responsive`, `a11y`, `smoke` | `npm run e2e -- --list` lists them all; run shows them skipped | ✅ |
| W1-07 | CI `e2e` job: Atlas via `MONGODB_URI`, checkout API repo into `./api`, uv + node, Playwright; report artifact on failure; `repository_dispatch` + nightly triggers | CI green (harness only) | ⏭️ |

**Gate:** harness green locally; every AC has a spec (CI deferred, see *Decision log*). → with A1, **unblocks feature work**.

## W5 — Contract sync (runs when A5 lands)

| ID | Task | Test first | Status |
|---|---|---|---|
| W5-01 | Enable `api-contract.spec.ts` (outer loop for A5) | red until A5 is done → green | ⬜ |
| W5-02 | `scripts/sync-contract.mjs` + `npm run sync-contract` (openapi.yaml → `schema.d.ts`; fixtures → `src/test/fixtures`, `e2e/fixtures/responses`) | `sync-contract.test.ts` (copies + generates) | ⬜ |
| W5-03 | CI freshness check: sync against checked-out API, `git diff --exit-code` | CI fails on a stale fixture (verify once, then fix) | ⬜ |
| W5-04 | MSW handlers serve synced fixtures (`POST /trips` → SC-2 etc.) | `handlers.test.ts` | ⬜ |

## W6 — Trip form + server status

Outer loop: enable `trip-form.spec.ts`.

| ID | Task | Test first | Status |
|---|---|---|---|
| W6-01 | Enable `trip-form.spec.ts` | red | ✅ |
| W6-02 | `useServerStatus` + `WakeBanner` (health on load; banner after 3 s) | `useServerStatus.test.ts` | ✅ |
| W6-03 | zod schema (locations selected, cycle 0–70 step 0.25) | `schema.test.ts` | ✅ |
| W6-04 | `LocationAutocomplete` (300 ms debounce, keyboard nav) | `LocationAutocomplete.test.tsx` | ✅ |
| W6-05 | `CycleInput` (slider + number; "X h available") | `CycleInput.test.tsx` | ✅ |
| W6-06 | Start time, tz, inspections toggle, collapsible `LogDetailsSection` with demo defaults | `TripForm.test.tsx` | ✅ |
| W6-07 | "Try a sample trip" | `TripForm.test.tsx::sample` | ✅ |
| W6-08 | Submit → staged loader → navigate `/trips/:id` | `TripForm.test.tsx::submit` | ✅ |

**Gate:** `trip-form.spec.ts` green on desktop + mobile.

## W7 — Map, stops, summary, share

| ID | Task | Test first | Status |
|---|---|---|---|
| W7-01 | Enable `route-map.spec.ts`, `share-link.spec.ts` | red | ✅ |
| W7-02 | `TripPage` with `useTrip`, skeletons | `TripPage.test.tsx` | ✅ |
| W7-03 | `SummaryCards` | `SummaryCards.test.tsx` | ✅ |
| W7-04 | `RouteMap`: polyline, fit bounds, typed SVG markers, `MapLegend` | `RouteMap.test.tsx` | ✅ |
| W7-05 | `StopsTimeline`: ordered, status colors, click → map flyTo + popup | `StopsTimeline.test.tsx` | ✅ |
| W7-06 | Copy share link | `share-link.spec.ts` | ✅ |

**Gate:** `route-map.spec.ts`, `share-link.spec.ts` green.

## W8 — Daily log sheets (highest visual payoff)

| ID | Task | Test first | Status |
|---|---|---|---|
| W8-01 | Enable `log-sheets.spec.ts`, `hos-scenarios.spec.ts` | red | ✅ |
| W8-02 | `LogGrid`: header bar (Mid-night … Noon … Mid-night), 4 labeled rows, 15-min ticks, totals column | `LogGrid.test.tsx` | ✅ |
| W8-03 | Duty path from segments (John Doe fixture) | `LogGrid.test.tsx::path` | ✅ |
| W8-04 | `LogHeader` in template wording (date m/d/y, From/To, miles boxes, vehicle numbers, carrier, main office, home terminal) | `LogHeader.test.tsx` | ✅ |
| W8-05 | `Remarks`: brackets + angled "City, ST" labels + list; shipping documents block | `Remarks.test.tsx` | ✅ |
| W8-06 | `Recap` (70 Hour/8 Day A/B/C + 34-hr restart note) | `Recap.test.tsx` | ✅ |
| W8-07 | `LogSheetPager` (prev/next, day tabs, "all sheets") | `LogSheetPager.test.tsx` | ✅ |
| W8-08 | Print/PDF: `print.css`, one sheet per page | `log-sheets.spec.ts::print` | ✅ |
| W8-09 | Visual snapshot of SC-2 Day 1 | `log-sheets.spec.ts::visual` | ✅ |

**Gate:** `log-sheets.spec.ts` + `hos-scenarios.spec.ts` green; sheet matches the company template side by side.

## W9 — UX polish, errors, cold start, responsive, a11y

| ID | Task | Test first | Status |
|---|---|---|---|
| W9-01 | Enable `cold-start`, `errors`, `responsive`, `a11y` specs | red | ✅ |
| W9-02 | Cold-start flow: wait for health, 90 s timeout, one retry on 502/503 (AC-46) | `cold-start.spec.ts` | ✅ |
| W9-03 | Error banner + retry for 400/422/502/network | `errors.spec.ts` | ✅ |
| W9-04 | Responsive 375 / 768 / 1440 | `responsive.spec.ts` | ✅ |
| W9-05 | Axe fixes (labels, focus, contrast, landmarks, legend not color-only) | `a11y.spec.ts` | ✅ |
| W9-06 | Visual polish: type scale, spacing, tokens, empty state, favicon, titles | screenshots review | ✅ |
| W9-07 | ⏭️ Dark mode | — | ⏭️ |

**Gate:** all non-smoke specs green on desktop + mobile.

## W10 — Production + smoke

| ID | Task | Test first | Status |
|---|---|---|---|
| W10-01 | Vercel production env: `VITE_API_BASE_URL` → Render; preview env too | — | ⬜ |
| W10-02 | Confirm API CORS includes prod + preview origins (A10-02) | browser request succeeds | ⬜ |
| W10-03 | Enable `smoke.spec.ts` (warm API via `E2E_API_URL/health/`, real trip, ≥ 1 sheet) | red → green | ⬜ |
| W10-04 | Run smoke after every production deploy | green | ⬜ |

## W11 — Deliverables

| ID | Task | Status |
|---|---|---|
| W11-01 | Web README: live URL, API repo link, screenshots/GIF, stack, E2E instructions, cold-start note | ⬜ |
| W11-02 | Final DoD check (tick every AC in `01-definition-of-done.md`) | ⬜ |
| W11-03 | Loom 3–5 min: live demo → logs vs company template → API engine + golden tests → Playwright run → trade-offs (two repos, cold start, assumptions) | ⬜ |
| W11-04 | Submit: Vercel URL + both GitHub repos + Loom | ⬜ |

---

## Decision log

| Date | Decision | Ref |
|---|---|---|
| 2026-09-23 | Two repos: API → Render, web → Vercel | 02 §1 |
| 2026-09-23 | Playwright E2E lives in the web repo and boots the sibling API; the API repo has pytest acceptance tests | 04 §1 |
| 2026-09-23 | Contract via committed `openapi.yaml` + fixtures; types generated with openapi-typescript | 04 §7 |
| 2026-09-23 | Cold-start UX is an acceptance criterion (AC-46) | 02 §3 |
| 2026-09-23 | **CI deferred (W0-05, W1-07; API A0-07).** No `.github/workflows/ci.yml` in either repo for now. Every run would connect to the shared Atlas cluster, and CI adds little while one person builds the foundation. Until it returns, run `npm run lint && npm run typecheck && npm run test:run && npm run e2e` locally before each PR. When re-added, the API side uses a throwaway MongoDB service container (`mongo:8`) instead of an Atlas secret | 04 §8 |
| 2026-09-24 | W6–W8 remain web-only while A5/W5 are pending: browser tests intercept geocode and trip requests with contract-shaped responses; replace them with synced fixtures during W5 | W5, W6, W7, W8 |

## Blockers / open questions

| # | Question | Status |
|---|---|---|
| 1 | — | — |
