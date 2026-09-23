import { expect, test } from '@playwright/test';

import { TWO_DAY_WORKED_EXAMPLE_TRIP } from '../fixtures/scenarios';
import { mockTripApi } from '../fixtures/mock-trip-api';
import { LogSheetsPage } from '../pages/LogSheetsPage';
import { PlannerPage } from '../pages/PlannerPage';

test.describe('Server cold start', () => {
  test('AC-46: a delayed server shows a wake message and planning succeeds without manual retry', async ({
    page,
  }) => {
    await mockTripApi(page);
    await page.route('**/api/health/', async (route) => {
      const response = await route.fetch();
      await new Promise((resolve) => setTimeout(resolve, 5_000));
      await route.fulfill({ response });
    });

    const planner = new PlannerPage(page);
    await planner.goto();
    await expect(page.getByTestId('wake-banner')).toContainText(
      'Waking up the server (≈1 min on the free tier)…',
    );
    await planner.fill(TWO_DAY_WORKED_EXAMPLE_TRIP.input);
    await planner.submit();

    await expect(page).toHaveURL(/\/trips\//);
  });

  test('AC-46: a trip request that hits a waking server is retried once and the trip renders', async ({
    page,
  }) => {
    await mockTripApi(page);
    let tripRequests = 0;
    await page.route('**/api/trips/', async (route) => {
      tripRequests += 1;
      if (tripRequests === 1) {
        await route.fulfill({
          status: 503,
          json: { error: { code: 'SERVER_UNAVAILABLE', message: 'Server is waking up.' } },
        });
        return;
      }
      await route.fallback();
    });

    const planner = new PlannerPage(page);
    await planner.goto();
    await planner.fill(TWO_DAY_WORKED_EXAMPLE_TRIP.input);
    await planner.submit();

    await expect(page).toHaveURL(/\/trips\//);
    await expect(new LogSheetsPage(page).sheets).toHaveCount(
      TWO_DAY_WORKED_EXAMPLE_TRIP.expected.logDays ?? 0,
    );
    expect(tripRequests).toBe(2);
  });
});
