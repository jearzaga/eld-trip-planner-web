# 05 — Getting Started (workspace, both repos)

This is the main onboarding guide. It sets up **both** repos side by side, gets the Playwright harness green, and lays
out the day-by-day plan. API-specific details are in `eld-trip-planner-api/docs/05-getting-started.md`.

## 1. Prerequisites

| Tool | Version |
|---|---|
| Git + GitHub CLI (`gh`) | recent |
| Python | 3.12 |
| uv | latest (`curl -LsSf https://astral.sh/uv/install.sh \| sh`) |
| Node.js | 22 LTS |
| Claude Code | latest |

Accounts to create on Day 1: **GitHub**, **Vercel**, **Render**, **MongoDB Atlas** (M0), **OpenRouteService** (free key;
needed from A10).

## 2. Workspace layout

```bash
mkdir -p ~/code/eld-trip-planner && cd ~/code/eld-trip-planner      # plain folder — NOT a git repo
gh repo create eld-trip-planner-api --public --clone
gh repo create eld-trip-planner-web --public --clone
```

```
~/code/eld-trip-planner/
├─ eld-trip-planner-api/   → Render
└─ eld-trip-planner-web/   → Vercel
```

Copy each planning package folder into its repo (`CLAUDE.md`, `README.md`, `docs/`) and commit:

```bash
cd eld-trip-planner-api && git add . && git commit -m "docs: A0-01 business rules, architecture, plan" && git push && cd ..
cd eld-trip-planner-web && git add . && git commit -m "docs: W0-01 DoD, architecture, plan, testing" && git push && cd ..
```

## 3. Day 1 — foundations (A0 + W0)

### 3.1 API (A0)

Follow `eld-trip-planner-api/docs/06-project-setup.md` (virtual environment, Django + DRF + MongoDB, first health test),
then the Render steps in `eld-trip-planner-api/docs/05-getting-started.md` §5. Finish A0 with
`https://<api>.onrender.com/api/health/` returning `{"status":"ok"}`.

### 3.2 Web (W0)

Follow **`06-project-setup.md`** in this repo (Vite + React TS, Tailwind, shadcn/ui, libraries, config, first test).

**Vercel:** Add New Project → import `eld-trip-planner-web` → Framework preset **Vite** → env
`VITE_API_BASE_URL=https://<api>.onrender.com/api` → Deploy. Then add the Vercel URL to the API's
`CORS_ALLOWED_ORIGINS` on Render.

## 4. Day 1–2 — Playwright harness (W1), before any feature

```bash
cd eld-trip-planner-web
npm i -D @playwright/test @axe-core/playwright openapi-typescript
npx playwright install --with-deps chromium
mkdir -p e2e/tests e2e/pages e2e/fixtures/responses scripts
```

1. Create `e2e/playwright.config.ts` from `04-testing-strategy.md` §6 and add the `e2e` / `e2e:ui` scripts.
2. Write the harness spec, watch it fail, then fix the wiring until it passes:

```ts
// e2e/tests/harness.spec.ts
import { test, expect } from '@playwright/test';

const API = process.env.E2E_API_URL ?? 'http://localhost:8000/api';

test('app shell loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /eld trip planner/i })).toBeVisible();
});

test('API health is ok', async ({ request }) => {
  const res = await request.get(`${API}/health/`);
  expect(res.ok()).toBeTruthy();
  expect(await res.json()).toEqual({ status: 'ok' });
});
```

```bash
npm run e2e          # boots Django from ../eld-trip-planner-api (fake geo) + Vite, runs desktop + mobile
npm run e2e:ui       # interactive
npx playwright show-report
```

3. Page objects + `e2e/fixtures/scenarios.ts`.
4. Every acceptance spec as `test.fixme('AC-xx: …')`. Check with `npm run e2e -- --list`.
5. Run the whole suite locally (`npm run e2e`); there is no CI (see `03-implementation-plan.md` *Decision log*). Then do **A1** in the API repo (pytest acceptance tests, skipped).

**W1 + A1 ✅ → feature work begins.**

## 5. The daily TDD loop

```
1. Pick the next ⬜ task in the right repo's tracker → 🟨
2. OUTER RED : remove test.fixme (Playwright) or the skip marker (API acceptance) → run → red
3. INNER RED : smallest failing Vitest/pytest test → red
4. GREEN     : minimum code
5. REFACTOR  : tests stay green
6. Repeat 3–5 until the outer test passes
7. Run the repo's full suite (+ web `npm run e2e` if the API contract/behavior changed)
8. Mark ✅ in the tracker (and the system overview if a phase finished) → commit with the task ID
```

**When the API contract changes (A5 and later):**

```bash
# in eld-trip-planner-api
uv run python manage.py spectacular --file openapi.yaml
uv run python manage.py dump_scenarios
git commit -am "contract: A5-05 add summary.stop_count"   # BREAKING: … if it breaks consumers
# in eld-trip-planner-web
npm run sync-contract && npm run typecheck && npm run e2e
git commit -am "chore(contract): sync from api@<sha>"
```

## 6. Working with Claude Code

| Situation | How to start Claude |
|---|---|
| API-only task | `cd eld-trip-planner-api && claude` |
| Web-only task | `cd eld-trip-planner-web && claude` |
| Cross-repo (contract, E2E against API changes) | `cd eld-trip-planner-web && claude --add-dir ../eld-trip-planner-api` |

Prompts that work well:

> Read CLAUDE.md and docs/ (and ../eld-trip-planner-api/docs/01-business-rules.md). Summarize the phases and what W1
> requires, then start W1-01 following the task script.

> Start W1-06. Write every acceptance spec as test.fixme, one test per AC in docs/01-definition-of-done.md, using the
> page objects and test IDs from docs/04-testing-strategy.md. Show me `npm run e2e -- --list`.

> Start A2-04 in the API repo. Write the failing tests, run them, show me the red. Stop before implementing.

> A5 is done. Enable api-contract.spec.ts, run `npm run sync-contract`, then run the spec and show me the result.

> Start W8-03. Enable the log-sheets spec, show the red, then TDD the duty path using the John Doe fixture.

Tips: use **plan mode** at the start of each phase; always ask Claude to **show the red**; if it proposes changing a
rule or an expected number, check the business rules first and record any decision in the Decision log.

## 7. Suggested schedule

| Day | Work | Outcome |
|---|---|---|
| 1 | A0, W0 (including Render + Vercel hello-world deploys) | Both repos live, local checks green |
| 2 | W1, A1, start A2 | Playwright harness + all acceptance specs; engine started |
| 3 | A2, A3 | Engine + logs proven by goldens and property tests |
| 4 | A4, A5, W5 | API done locally; contract synced; `api-contract.spec.ts` green |
| 5 | W6, W7 | Form + map + stops working end to end |
| 6 | W8 | Log sheets matching the template |
| 7 | W9, A10, W10 | Polish, cold-start UX, production smoke green |
| 7.5 | A11, W11 | READMEs, Loom, submit |
