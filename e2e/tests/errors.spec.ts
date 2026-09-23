import { expect, test } from '@playwright/test';

import { TWO_DAY_WORKED_EXAMPLE_TRIP, UNROUTABLE_TRIP } from '../fixtures/scenarios';
import { mockTripApi } from '../fixtures/mock-trip-api';
import { PlannerPage } from '../pages/PlannerPage';

test.describe('Loading and recovery', () => {
  test('AC-42: planning shows staged progress and stable result skeletons', async ({ page }) => {
    await mockTripApi(page, { planningDelayMs: 3_000 });
    const planner = new PlannerPage(page);
    await planner.goto();
    await planner.fill(TWO_DAY_WORKED_EXAMPLE_TRIP.input);
    await planner.submit();

    const loader = page.getByTestId('planning-loader');
    await expect(loader).toBeVisible();
    await expect(loader).toContainText(/routing|hours-of-service|drawing logs/i);
  });

  test('AC-43: an unroutable trip preserves input and offers recovery', async ({ page }) => {
    await mockTripApi(page);
    const planner = new PlannerPage(page);
    await planner.goto();
    await planner.fill(UNROUTABLE_TRIP.input);
    await planner.submit();

    await expect(page.getByTestId('error-banner')).toContainText(/route/i);
    await expect(page.getByTestId('error-retry')).toBeVisible();
    await expect(planner.currentLocation).toHaveValue(UNROUTABLE_TRIP.input.current.label);
  });

  test('AC-43: a provider failure after the automatic retry offers recovery', async ({ page }) => {
    await mockTripApi(page);
    await page.route('**/api/trips/', (route) =>
      route.fulfill({
        status: 502,
        json: { error: { code: 'PROVIDER_UNAVAILABLE', message: 'Routing is unavailable.' } },
      }),
    );
    const planner = new PlannerPage(page);
    await planner.goto();
    await planner.fill(TWO_DAY_WORKED_EXAMPLE_TRIP.input);
    await planner.submit();

    await expect(page.getByTestId('error-banner')).toContainText(/planning server/i);
    await expect(page.getByTestId('error-retry')).toBeVisible();
    await expect(planner.dropoffLocation).toHaveValue(
      TWO_DAY_WORKED_EXAMPLE_TRIP.input.dropoff.label,
    );
  });

  test('AC-43: a network failure explains the connection problem and offers recovery', async ({
    page,
  }) => {
    await mockTripApi(page);
    await page.route('**/api/trips/', (route) => route.abort());
    const planner = new PlannerPage(page);
    await planner.goto();
    await planner.fill(TWO_DAY_WORKED_EXAMPLE_TRIP.input);
    await planner.submit();

    await expect(page.getByTestId('error-banner')).toContainText(/could not reach/i);
    await expect(page.getByTestId('error-retry')).toBeVisible();
    await expect(planner.dropoffLocation).toHaveValue(
      TWO_DAY_WORKED_EXAMPLE_TRIP.input.dropoff.label,
    );
  });
});
