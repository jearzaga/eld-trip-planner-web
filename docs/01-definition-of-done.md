# 01 — Definition of Done (product-wide, both repos)

> **Canonical copy for the whole product.** The API repo links here.
> Business rules (R-xx), assumptions (A-xx) and the glossary live in
> `eld-trip-planner-api/docs/01-business-rules.md`.

Two levels:

1. **Product DoD**: what must be true to submit the assessment.
2. **Task DoD**: what must be true to mark any task (`A#-##` / `W#-##`) ✅.

---

## 0. What we're building (one paragraph)

A trip planner for a property-carrying truck driver. Inputs: current location, pickup, dropoff and current cycle used (hrs).
The system plans a legal trip under FMCSA Hours-of-Service rules and outputs:

1. a map of the route, showing every required stop;
2. the driver's daily log sheets, filled out and drawn like the company's paper template, one per day.

Graders test the hosted app for HOS accuracy and judge UI/UX; strong design can compensate for small inaccuracies.

---

## 1. Product Definition of Done

### 1.1 Deliverables

| ID | Criterion | Verified by |
|---|---|---|
| **DEL-1** | Live app on Vercel (web) talking to the live API on Render | web `@smoke` E2E |
| **DEL-2** | **Two public GitHub repos**, each with a README that links to the other repo, the live URLs and the Loom. The API README covers rules R-xx, assumptions A-xx and out-of-scope items; the web README covers the UI and the E2E suite | Manual review |
| **DEL-3** | 3–5 minute Loom covering the app **and** the code in both repos | Manual |

### 1.2 Inputs

| ID | Criterion |
|---|---|
| **AC-01** | Current, pickup and dropoff locations can be entered with debounced autocomplete and a selection step. |
| **AC-02** | Current cycle used (hrs), 0–70 in steps of 0.25. Invalid values show an inline error and block submit (validated on both client and API). |
| **AC-03** | Optional trip start date/time and home-terminal time zone, with defaults per A-11. |
| **AC-04** | Optional "Log details" section (driver, carrier, main office, home terminal, truck/trailer numbers, shipping document), pre-filled with demo defaults (A-15). |
| **AC-05** | A **"Try a sample trip"** button fills the form with a known multi-day scenario. |

### 1.3 Output 1: route map and stops

| ID | Criterion |
|---|---|
| **AC-10** | Route line drawn on a free map (Leaflet + OSM-based tiles), zoomed to fit the route. |
| **AC-11** | Distinct markers, plus a legend, for start, pickup, dropoff, fuel, 30-min break, 10-hr rest and 34-hr restart. |
| **AC-12** | Stops timeline in order: type, "City, ST", arrival, departure, duration. Clicking a stop focuses it on the map. |
| **AC-13** | Summary showing total miles, driving hours, trip duration, arrival, number of log sheets and number of stops. |

### 1.4 Output 2: daily log sheets

| ID | Criterion |
|---|---|
| **AC-20** | One sheet per calendar day the trip touches (R-08, R-10). |
| **AC-21** | Layout mirrors the company's blank *Drivers Daily Log* template: header, 24-h grid with 4 rows and 15-min ticks, total-hours column, remarks, shipping documents, 70-hr/8-day recap. |
| **AC-22** | The duty line is one continuous path: horizontal within a row, vertical at each status change. |
| **AC-23** | Row totals appear on the right and **sum to 24** on every sheet. |
| **AC-24** | Header filled in: date, From/To, miles driving today, total mileage today, truck/trailer numbers, carrier, main office, home terminal (R-11). |
| **AC-25** | Remarks give "City, ST" and a reason at **every** status change, with a bracket marked under the grid (R-09). |
| **AC-26** | Recap filled in: on duty today, A, B = 70 − A, C, and a restart note when a 34-hr restart was taken (R-12). |
| **AC-27** | Pager between sheets, plus print / save as PDF at one sheet per page. |

### 1.5 HOS accuracy

| ID | Criterion |
|---|---|
| **AC-30** | No plan violates R-01…R-07, whether the trip is short, multi-day or cross-country. |
| **AC-31** | A high starting cycle (e.g. 65) triggers a 34-hr restart before 70 h is exceeded. A starting cycle of 70 begins with a restart. |
| **AC-32** | A fuel stop at or before every 1,000 miles driven. |
| **AC-33** | Scenario SC-2 reproduces the worked example (business rules §8) exactly. |
| **AC-34** | The log builder reproduces the guide's John Doe log (10 / 1.75 / 7.75 / 4.5). |
| **AC-35** | Every segment boundary falls on a 15-minute mark, and all times are shown in home-terminal time. |

### 1.6 UI / UX

| ID | Criterion |
|---|---|
| **AC-40** | Clean, consistent visual design (spacing, type scale, color tokens), with no layout shift when results load. |
| **AC-41** | Responsive at 375 px and 1440 px, with no horizontal scroll. |
| **AC-42** | Staged loading messages while planning; skeletons for the map and logs. |
| **AC-43** | Friendly errors for validation, unroutable address, provider failure and network failure, each with a recovery action. |
| **AC-44** | Accessible: labeled inputs, keyboard navigable, visible focus, color never the only signal. **No serious or critical axe violations.** |
| **AC-45** | A shareable `/trips/:id` URL reloads the same plan. |
| **AC-46** | **Cold-start handling:** when the Render API is waking up, the UI shows "Waking up the server (≈1 min on the free tier)…" and the request succeeds without the user having to retry. |

### 1.7 Engineering quality

| ID | Criterion |
|---|---|
| **ENG-1** | Web CI: lint, typecheck, Vitest, and Playwright (desktop + mobile) against the sibling API checked out in CI with fake geo. |
| **ENG-2** | API CI: ruff and pytest (unit, API, acceptance, contract). Coverage: `hos/` ≥ 95 %, overall ≥ 85 %. |
| **ENG-3** | **Contract sync:** `openapi.yaml` and scenario fixtures are committed in the API repo and fresh; the web repo's generated types are up to date; `api-contract.spec.ts` is green. |
| **ENG-4** | No secrets in either repo. CORS allows only the Vercel origins. |
| **ENG-5** | `@smoke` is green against production (Vercel + Render) after the final deploy. |

### 1.8 Out of scope

See business rules §11: split sleeper berth, adverse conditions, short-haul exceptions, 60/7 cycle, team drivers, auth.

---

## 2. Task Definition of Done (both repos)

A task is ✅ only when:

- [ ] **Red first:** the new or enabled test was run and failed for the expected reason before any code was written.
- [ ] **Green:** unit/component tests pass.
- [ ] **Outer loop:** the related acceptance test passes. That means the pytest acceptance test in the API repo, and/or the Playwright spec with `fixme` removed.
- [ ] **No regressions:** the full suite of the repo you changed passes. If the API contract or behavior changed, the web repo's `npm run e2e` passes too.
- [ ] **Refactored and clean:** glossary names used, rule IDs cited, lint and typecheck pass.
- [ ] **Contract:** artifacts regenerated (API) or synced (web) if the shape changed.
- [ ] **Tracked:** status updated in that repo's `docs/03-implementation-plan.md` in the same commit.

**Phase gates:** a phase is ✅ when all its tasks are ✅ and its Gate passes.
**W1 (Playwright harness) and A1 must be ✅ before any feature phase (A2+, W6+).**

---

## 3. Traceability matrix

`api:` = `eld-trip-planner-api`, `web:` = `eld-trip-planner-web`.

| AC | Rules | Automated tests |
|---|---|---|
| AC-01, 02, 05 | — | web: `e2e/tests/trip-form.spec.ts`, `src/features/trip-form/*.test.tsx` · api: `tests/api/test_trips_validation.py` |
| AC-03, 04 | A-11, A-15 | web: `trip-form.spec.ts` · api: `tests/api/test_trips_create.py` |
| AC-10, 11 | — | web: `e2e/tests/route-map.spec.ts` |
| AC-12, 13 | — | web: `route-map.spec.ts`, `src/features/stops/*.test.tsx` |
| AC-20, 23 | R-08, R-10 | web: `e2e/tests/log-sheets.spec.ts` · api: `tests/unit/hos/test_log_builder.py` |
| AC-21, 22 | — | web: `log-sheets.spec.ts` (visual snapshot), `src/features/log-sheets/*.test.tsx` |
| AC-24, 26 | R-11, R-12 | web: `log-sheets.spec.ts` · api: `test_log_builder.py::test_header_*`, `::test_recap_*` |
| AC-25 | R-09 | api: `test_log_builder.py::test_remarks_*` · web: `log-sheets.spec.ts` |
| AC-27 | — | web: `log-sheets.spec.ts::print` |
| AC-30 | R-01…R-07 | api: `tests/unit/hos/test_engine_*.py`, `test_engine_invariants.py`, `tests/acceptance/` |
| AC-31 | R-04, A-05 | api: `test_engine_cycle.py`, acceptance SC-3/SC-4 · web: `hos-scenarios.spec.ts` |
| AC-32 | R-06, A-09 | api: `test_engine_fuel.py`, acceptance SC-5 · web: `hos-scenarios.spec.ts` |
| AC-33 | all | api: `test_engine_worked_example.py`, acceptance SC-2 · web: `hos-scenarios.spec.ts` (SC-2 on screen) |
| AC-34 | R-08 | api: `test_log_builder.py::test_john_doe_golden` · web: `LogSheet.test.tsx` (John Doe fixture) |
| AC-35 | A-10, R-08 | api: `test_engine_invariants.py`, `test_log_builder.py::test_timezone_*` |
| AC-40, 41 | — | web: `e2e/tests/responsive.spec.ts` |
| AC-42, 43 | — | web: `e2e/tests/errors.spec.ts`, component tests |
| AC-44 | — | web: `e2e/tests/a11y.spec.ts` |
| AC-45 | — | web: `e2e/tests/share-link.spec.ts` · api: `tests/api/test_trips_retrieve.py` |
| AC-46 | — | web: `e2e/tests/cold-start.spec.ts` (delayed health via `page.route`) |
| ENG-3 | — | api: `tests/contract/*` · web: `e2e/tests/api-contract.spec.ts` |
| DEL-1, ENG-5 | — | web: `e2e/tests/smoke.spec.ts` (`@smoke`) |
