# CLAUDE.md — ELD Trip Planner · Web (frontend repo)

Instructions for Claude Code in **`eld-trip-planner-web`**. Read fully before every task.

## The system (two repos)

| Repo | What | Hosting |
|---|---|---|
| `eld-trip-planner-api` | Django + DRF + MongoDB. HOS engine, log builder, routing/geocoding, REST API | **Render** + MongoDB Atlas |
| **`eld-trip-planner-web`** (this repo) | React + Vite SPA: trip form, route map, stops, **log-sheet drawing**, and the **Playwright E2E suite** for the whole system | **Vercel** |

Local layout (siblings in one plain folder, which is **not** a git repo):

```
eld-trip-planner/
├─ eld-trip-planner-api/
└─ eld-trip-planner-web/   ← you are here
```

Playwright boots the sibling API automatically (`API_DIR`, relative to this repo's root, default `../eld-trip-planner-api`; CI uses `./api`).
For cross-repo tasks start Claude with: `claude --add-dir ../eld-trip-planner-api`

## What this repo does

Collects trip inputs, calls the API, and **renders** the results: map with route and stops, stops timeline, summary,
and the Driver's Daily Log sheets drawn like the company's paper template. **The frontend never computes HOS** —
all segments, totals, remarks and recap numbers come from the API. The frontend only draws them.

## Source-of-truth documents

| Doc | Use it for |
|---|---|
| `docs/01-definition-of-done.md` | **Canonical** product acceptance criteria (AC-xx), traceability, task DoD |
| `docs/02-architecture.md` | System overview, frontend structure, log-sheet rendering, Vercel deploy, cold-start UX |
| `docs/03-implementation-plan.md` | **System progress overview** + web tasks (`W#-##`) with status — update as you work |
| `docs/04-testing-strategy.md` | **Playwright-first** strategy, spec list, `data-testid` contract, config, cross-repo CI |
| `docs/05-getting-started.md` | Workspace onboarding for both repos, schedule, TDD loop, Claude Code prompts |
| `docs/06-project-setup.md` | Vite + React TS, Tailwind, shadcn/ui, libraries (state, API, forms, map, tests), config files |
| `../eld-trip-planner-api/docs/01-business-rules.md` | **Canonical** HOS rules, glossary, worked example (read-only from here) |
| `../eld-trip-planner-api/docs/02-architecture.md` §5 | **API contract** (source of truth; generated `openapi.yaml`) |
| `docs/reference/blank-drivers-daily-log-template.png` | The company's log template the sheet must mirror |

If code and docs disagree, **stop and ask**.

## Non-negotiable rules

1. **Playwright harness first.** Phase **W1** (Playwright harness + every acceptance spec as `test.fixme`) must be ✅
   before any feature work in either repo.
2. **Strict TDD, double loop.** Outer: remove `test.fixme` from the Playwright spec → run → red. Inner: failing
   Vitest/RTL test → minimum code → refactor. No production code without a failing test. Never weaken or delete a test
   to go green.
3. **Show the red** before implementing.
4. **No HOS math in the frontend.** If a number is missing, it's an API contract change, so raise it for the API repo.
5. **API types are generated**, never hand-edited: `npm run sync-contract` copies `openapi.yaml` + scenario response
   fixtures from `../eld-trip-planner-api` and regenerates `src/lib/api/schema.d.ts`.
6. **Test IDs are a contract** (`docs/04-testing-strategy.md` §5). Don't rename without updating the doc and specs.
7. **Log sheets mirror the company template**: its labels, four rows, 15-min ticks, totals column, remarks, and recap block.
8. **Cold starts are expected** (Render free tier). Warm up with `/api/health/` and show a friendly "waking up" state (AC-46).
9. **Update the tracker** in the same commit that changes a task's state.
10. No features outside scope without asking.
11. **No explanatory comments.** Write the code itself. Add a comment only when it is necessary (a non-obvious "why").
    Never narrate what the code does, in code or config files.
12. **PRs only.** Never commit or push to `main`. Work on a `feat/*`/`fix/*`/`chore/*` branch and open a PR into `main`
    (`/push-to-git`). There is no `development` or `staging` branch.

## Repo layout

```
eld-trip-planner-web/
├─ CLAUDE.md · README.md · vercel.json · package.json · vite.config.ts · tsconfig*.json
├─ src/
│  ├─ app/          # router, providers (QueryClient), theme tokens
│  ├─ pages/        # PlannerPage (/), TripPage (/trips/:id), NotFound
│  ├─ features/     # trip-form/, summary/, route-map/, stops/, log-sheets/, server-status/
│  ├─ components/ui # shadcn primitives
│  ├─ stores/       # ui-store.ts (Zustand)
│  ├─ lib/api/      # client.ts (axios), schema.d.ts (generated), hooks.ts
│  └─ test/         # setup.ts, msw handlers, fixtures/ (synced from API)
├─ e2e/
│  ├─ playwright.config.ts
│  ├─ tests/        # *.spec.ts acceptance specs (system-wide)
│  ├─ pages/        # page objects
│  └─ fixtures/     # scenarios.ts + synced API responses
├─ scripts/sync-contract.mjs
├─ docs/
└─ .github/workflows/ci.yml
```

## Commands

```bash
npm run dev                      # http://localhost:5173 (expects API at VITE_API_BASE_URL, default http://localhost:8000/api)
npm run test                     # Vitest + RTL
npm run lint && npm run typecheck
npm run sync-contract            # pull openapi.yaml + fixtures from ../eld-trip-planner-api, regenerate types
npm run e2e                      # Playwright: boots API (fake geo) + Vite, desktop + mobile
npm run e2e -- tests/log-sheets.spec.ts --headed
npm run e2e:ui                   # Playwright UI mode
E2E_BASE_URL=https://<app>.vercel.app npm run e2e -- --project=smoke   # production smoke
```

## Conventions

- Strict TypeScript; feature folders. **State:** TanStack Query for API data · Zustand for shared UI state · URL for
  shareable state · react-hook-form + zod for forms · local `useState` for the rest.
- **HTTP:** only through the axios instance in `src/lib/api/client.ts` (never raw `fetch` in components).
- **UI:** shadcn/ui components in `src/components/ui/` (add with `npx shadcn@latest add <name>`); `cn()` from `@/lib/utils`.
- Prefer `getByRole` / `getByLabel` in tests; use `data-testid` for data regions.
- `LogSheet` is a pure component of one `daily_log` object. Grid math: `x = left + (min / 1440) * width`.
- Tailwind tokens for color/spacing; duty-status colors are shared by the map legend, timeline and log sheet.
- Conventional commits with task IDs: `test(log-sheets): W8-03 failing test for duty path` → `feat(log-sheets): W8-03 …`.

## Task script

1. Read the task row in `docs/03-implementation-plan.md` and its AC-xx.
2. Mark 🟨.
3. Remove `test.fixme` from the related Playwright test (if the task completes an AC) → run → red.
4. Write the failing component/unit test → run → red.
5. Minimum code → green → refactor.
6. `npm run test && npm run typecheck && npm run lint && npm run e2e`.
7. Mark ✅, commit with the task ID.

## Per-task Definition of Done

- [ ] Test written first and seen failing
- [ ] Vitest green; related Playwright spec un-`fixme`d and green (desktop + mobile)
- [ ] Lint + typecheck clean
- [ ] No hand-edited API types; fixtures synced if the contract changed
- [ ] Test IDs match the contract
- [ ] Tracker updated in the same commit
