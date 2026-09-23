# 04 — Testing Strategy (Playwright-first, system-wide)

> Backend unit/acceptance testing and the **canonical scenario definitions (SC-1…SC-7)** live in
> `eld-trip-planner-api/docs/04-testing-strategy.md`.

## 1. Principles

1. **Acceptance tests before features.** Phase **W1** builds the Playwright harness and writes **every** acceptance spec
   from `01-definition-of-done.md` as `test.fixme(...)`. No feature work starts in either repo until W1 is ✅.
2. **Double-loop TDD.**
   ```
   ┌─ OUTER (Playwright spec, per AC) ─────────────────────────────────────────┐
   │ 1. remove test.fixme → run → RED                                            │
   │ ┌─ INNER (Vitest/RTL here · pytest in the API repo) ─────────────────────┐ │
   │ │ a. smallest failing test → RED   b. minimum code → GREEN   c. refactor  │ │
   │ └─ repeat until the outer spec can pass ─────────────────────────────────┘ │
   │ 2. spec GREEN → commit → update tracker                                     │
   └──────────────────────────────────────────────────────────────────────────────┘
   ```
3. **The real stack, deterministic data.** E2E runs the real Django API (sibling checkout), real React, real MongoDB,
   with `GEO_PROVIDER=fake`. No network, stable numbers.
4. **Consumer-driven contract.** `api-contract.spec.ts` checks the live local API against the scenario fixtures the web
   repo relies on.
5. **Never weaken a test to go green.**

## 2. Test pyramid (web side)

| Layer | Tool | Location | Speed |
|---|---|---|---|
| Unit / component | Vitest + React Testing Library + MSW (serves synced API fixtures) | `src/**/*.test.ts(x)` | ms |
| **E2E acceptance** | **Playwright** (Chromium desktop + Pixel 7) | `e2e/tests/*.spec.ts` | s |
| Consumer contract | Playwright `request` | `e2e/tests/api-contract.spec.ts` | s |
| Visual | Playwright `toHaveScreenshot` | `e2e/tests/log-sheets.spec.ts` | s |
| Accessibility | @axe-core/playwright | `e2e/tests/a11y.spec.ts` | s |
| Production smoke | Playwright `@smoke` | `e2e/tests/smoke.spec.ts` | s |

## 3. Scenarios used by E2E

Defined canonically in the API repo; mirrored in `e2e/fixtures/scenarios.ts` (inputs + key expectations) and
`e2e/fixtures/responses/*.json` (synced from `api/tests/fixtures/responses/`).

| ID | Summary | Key E2E assertions |
|---|---|---|
| SC-1 | Short day, cycle 0 | 1 sheet; stops pickup, dropoff only |
| SC-2 | Two-day worked example, cycle 20 | 2 sheets; Day 1 totals 6.5 / 5.25 / 11 / 1.25; Day 2 8.5 / 4.75 / 9 / 1.75; stops pickup → 30-min → 10-hr → fuel → dropoff |
| SC-3 | Cycle 65 | a `restart_34` stop + restart note on recap; 4 sheets |
| SC-4 | Cycle 70 | first stop is `restart_34`; 2 sheets, Day 1 all OFF |
| SC-5 | Cross-country | 2 fuel, 4 rest_10; 5 sheets, each totals 24 |
| SC-6 | Unroutable | error banner with retry; form keeps values |
| SC-7 | Pickup at current location | pickup immediately after pre-trip |

## 4. Spec files (all created in W1 as `test.fixme`)

| Spec | Covers | Enabled in |
|---|---|---|
| `harness.spec.ts` | App shell loads; API `/api/health/` ok (proves both servers + Mongo boot) | **W1** (green immediately) |
| `api-contract.spec.ts` | `POST /api/trips/` for SC-1…SC-7: status codes, response shape, key numbers match synced fixtures | **A5** (API phase) |
| `full-system.spec.ts` | No mocks: sample trip planned through the real API → `/trips/<id>` renders map, stops, filled log header, totals 24, and reloads (AC-45); SC-5 draws one sheet per API `daily_logs` entry | W5 |
| `trip-form.spec.ts` | AC-01…AC-05 | W6 |
| `route-map.spec.ts` | AC-10…AC-13 | W7 |
| `share-link.spec.ts` | AC-45 | W7 |
| `log-sheets.spec.ts` | AC-20…AC-27 (+ visual snapshot, print) | W8 |
| `hos-scenarios.spec.ts` | AC-30…AC-35 as seen on screen (SC-1…SC-5) | W8 |
| `cold-start.spec.ts` | AC-46: `page.route` delays `/api/health/` 5 s → wake banner visible → plan succeeds; a first `503` on `POST /trips/` is retried once and the trip renders | W9 |
| `errors.spec.ts` | AC-42, AC-43: loading stages, SC-6 (422), provider `502`, network abort | W9 |
| `responsive.spec.ts` | AC-40, AC-41: no horizontal scroll at 375 / 1440 | W9 |
| `a11y.spec.ts` | AC-44: axe on planner + results pages | W9 |
| `smoke.spec.ts` | `@smoke`: production Vercel + Render, real providers; warms API first | W10 |

## 5. `data-testid` contract

Specs are written before components exist, so these IDs are the contract. Prefer `getByRole` / `getByLabel` for
controls; use test IDs for data regions.

| Area | Test IDs |
|---|---|
| Server status | `wake-banner` |
| Form | `trip-form`, `input-current`, `input-pickup`, `input-dropoff`, `input-cycle-used`, `input-start-time`, `toggle-inspections`, `log-details`, `btn-sample-trip`, `btn-plan-trip` |
| Autocomplete | `suggestions-<field>`, `suggestion-item` |
| Status | `planning-loader`, `error-banner`, `error-retry` |
| Summary | `summary-total-miles`, `summary-driving-hrs`, `summary-duration`, `summary-arrival`, `summary-log-days`, `summary-stop-count` |
| Map | `route-map`, `route-polyline`, `map-legend`, `marker-<type>`, `route-legs`, `route-leg` |
| Timeline | `stops-timeline`, `stop-item` (`data-stop-type`, `data-seq`) |
| Log sheet | `log-sheet` (`data-day`), `log-date`, `log-from`, `log-to`, `log-miles-driving`, `log-total-mileage`, `log-carrier`, `log-main-office`, `log-home-terminal`, `log-vehicle-numbers`, `log-shipping-doc` |
| Grid | `log-grid`, `duty-line`, `total-OFF`, `total-SB`, `total-D`, `total-ON`, `total-sum` |
| Remarks / recap | `remark-item`, `recap-on-duty-today`, `recap-a`, `recap-b`, `recap-c`, `recap-restart-note` |
| Pager / print / share | `log-pager`, `btn-prev-log`, `btn-next-log`, `btn-print-logs`, `btn-copy-link` |

### 5.1 How specs reach the API

The frontend always calls `VITE_API_BASE_URL`, and the tests don't need to know that URL: specs that call the API directly (`harness`,
`api-contract`, `full-system`) import `apiUrl` from `e2e/fixtures/api-url.ts`: `E2E_API_URL`, else `http://localhost:${E2E_API_PORT ?? 8000}/api`.
The config passes `CORS_ALLOWED_ORIGINS` for the E2E web origin to the API, so alternate ports (`E2E_PORT`, `E2E_API_PORT`) work.

## 6. Playwright configuration

```ts
// e2e/playwright.config.ts
import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';

// npm scripts run from the web repo root, so paths resolve from there
const ROOT = process.cwd();
const API_DIR = path.resolve(ROOT, process.env.API_DIR ?? '../eld-trip-planner-api');
const PROD_WEB = process.env.E2E_BASE_URL;                                             // set only for production smoke

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { open: 'never' }], ['list']],
  use: { baseURL: 'http://localhost:5173', trace: 'on-first-retry', screenshot: 'only-on-failure' },
  projects: PROD_WEB
    ? [{ name: 'smoke', use: { ...devices['Desktop Chrome'], baseURL: PROD_WEB }, grep: /@smoke/, timeout: 180_000 }]
    : [
        { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } }, grepInvert: /@smoke/ },
        { name: 'mobile',  use: { ...devices['Pixel 7'] }, grepInvert: /@smoke/ },
      ],
  webServer: PROD_WEB ? undefined : [
    {
      command: 'uv run python manage.py runserver 8000 --noreload',
      cwd: API_DIR,
      url: 'http://localhost:8000/api/health/',
      // MONGODB_URI (Atlas) comes from the API's .env locally, 
      env: { GEO_PROVIDER: 'fake', MONGODB_DB: 'eld_e2e', DJANGO_DEBUG: '1' },
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'npm run dev -- --port 5173 --strictPort',
      cwd: ROOT,
      url: 'http://localhost:5173',
      env: { VITE_API_BASE_URL: 'http://localhost:8000/api' },
      reuseExistingServer: !process.env.CI,
    },
  ],
});
```

`package.json` scripts: `"e2e": "playwright test -c e2e/playwright.config.ts"`, `"e2e:ui": "playwright test -c e2e/playwright.config.ts --ui"`.

### Example acceptance spec (written in W1, enabled in W8)

```ts
// e2e/tests/log-sheets.spec.ts
import { test, expect } from '@playwright/test';
import { PlannerPage } from '../pages/PlannerPage';
import { SC2 } from '../fixtures/scenarios';

test.describe('Daily log sheets', () => {
  test.fixme('AC-20/23: SC-2 produces 2 sheets whose totals match the worked example', async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.goto();
    await planner.fill(SC2.input);
    await planner.submit();

    const sheets = page.getByTestId('log-sheet');
    await expect(sheets).toHaveCount(2);
    for (const [i, day] of SC2.expected.days.entries()) {
      const sheet = sheets.nth(i);
      await expect(sheet.getByTestId('total-OFF')).toHaveText(day.OFF);
      await expect(sheet.getByTestId('total-SB')).toHaveText(day.SB);
      await expect(sheet.getByTestId('total-D')).toHaveText(day.D);
      await expect(sheet.getByTestId('total-ON')).toHaveText(day.ON);
      await expect(sheet.getByTestId('total-sum')).toHaveText('24');
    }
  });
});
```

## 7. Contract sync (`npm run sync-contract`)

`scripts/sync-contract.mjs`:

1. Copies `../eld-trip-planner-api/openapi.yaml` → `src/lib/api/openapi.yaml`.
2. Runs `openapi-typescript src/lib/api/openapi.yaml -o src/lib/api/schema.d.ts`.
3. Copies `../eld-trip-planner-api/tests/fixtures/responses/*.json` → `src/test/fixtures/` and `e2e/fixtures/responses/`.

Commit the results with `chore(contract): sync from api@<short-sha>`. Before each PR, `npm run check-contract` re-runs the sync against the sibling API
and fails if `git diff` shows changes, which means the web repo is behind the API.

## 8. Local checks

No CI pipelines (decision 2026-09-24). Run every check locally before each PR:

```bash
npm run lint && npm run typecheck && npm run test:run && npm run check-contract && npm run e2e
```
