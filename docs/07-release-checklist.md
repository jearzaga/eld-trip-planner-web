# Web release and demo checklist

This checklist tracks the evidence needed for W11. The [product Definition of Done](01-definition-of-done.md) remains the canonical acceptance list.

## Verified locally

- [x] W6–W9 UI acceptance specs pass on desktop and mobile with deterministic web mocks.
- [x] The sample trip renders route results and printable daily log sheets from response data.
- [x] The Day 1 log visual reference passes on desktop and mobile.
- [x] Unit tests, typecheck, lint, build, and the current Playwright suite pass.
- [x] SPA route rewrite exists for direct visits to `/trips/:id`.

## Required before final DoD sign-off

- [x] API A5 published the trip and geocode endpoints, `openapi.yaml`, and SC-1…SC-7 response fixtures.
- [ ] Finish W5: commit synced artifacts, confirm the live consumer-contract CI, and replace temporary browser mocks with synced fixtures.
- [ ] Add the final Vercel app URL and Loom URL to both repository READMEs.
- [ ] Confirm production and preview `VITE_API_BASE_URL` values and API CORS from the deployed browser (W10).
- [ ] Enable and pass the real-provider `@smoke` test after deployment (W10).
- [x] Web unit CI passed its first pull request run (W0-05).
- [ ] Add the deferred full UI E2E CI job with Linux visual snapshots and run all required checks on the final commits. Consumer-contract CI uses an isolated MongoDB service.
- [ ] Review every AC and deliverable in [01-definition-of-done.md](01-definition-of-done.md) against the integrated, hosted system.
- [ ] Record the 3–5 minute Loom and submit the app, both repositories, and video.

## Suggested 4-minute Loom flow

1. **0:00–0:45 — Input:** open the live planner, explain current/pickup/drop-off and current cycle use, then load the sample trip.
2. **0:45–1:30 — Route:** show the map, required stop types, ordered timeline, and trip summary. Focus a stop from the timeline.
3. **1:30–2:30 — Logs:** page through the daily sheets, compare the first sheet with the company template, and show print/PDF.
4. **2:30–3:20 — Code:** show that the API owns HOS and response fixtures while the web app renders the result; point to the John Doe golden and SC-2 tests.
5. **3:20–4:00 — Verification and trade-offs:** show Playwright, the contract sync workflow, cold-start behavior, and any remaining assumptions.
