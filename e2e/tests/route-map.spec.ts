import { expect, test } from '@playwright/test';

import { TWO_DAY_WORKED_EXAMPLE_TRIP } from '../fixtures/scenarios';
import { PlannerPage } from '../pages/PlannerPage';
import { ResultsPage } from '../pages/ResultsPage';

test.describe('Route results', () => {
  test.beforeEach(async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.goto();
    await planner.fill(TWO_DAY_WORKED_EXAMPLE_TRIP.input);
    await planner.submit();
  });

  test.fixme('AC-10: the route line is drawn and fitted on the map', async ({ page }) => {
    const results = new ResultsPage(page);

    await expect(results.map).toBeVisible();
    await expect(results.routePolyline).toBeVisible();
  });

  test.fixme('AC-11: the map distinguishes every stop type and explains them in a legend', async ({
    page,
  }) => {
    const results = new ResultsPage(page);

    await expect(results.mapLegend).toContainText([
      'Start',
      'Pickup',
      'Drop-off',
      'Fuel',
      '30-minute break',
      '10-hour rest',
    ]);
    await expect(page.getByTestId('marker-pickup')).toBeVisible();
    await expect(page.getByTestId('marker-dropoff')).toBeVisible();
  });

  test.fixme('AC-12: ordered stops show timing and focus the selected map marker', async ({
    page,
  }) => {
    const results = new ResultsPage(page);

    await expect(results.stopItems).toHaveCount(
      TWO_DAY_WORKED_EXAMPLE_TRIP.expected.stopTypes?.length ?? 0,
    );
    await results.stopItems.nth(1).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test.fixme('AC-13: summary reports route, timing, sheets, and stops', async ({ page }) => {
    const results = new ResultsPage(page);

    await expect(results.totalMiles).not.toBeEmpty();
    await expect(results.drivingHours).not.toBeEmpty();
    await expect(results.duration).not.toBeEmpty();
    await expect(results.arrival).not.toBeEmpty();
    await expect(results.logDays).toHaveText('2');
    await expect(results.stopCount).toHaveText('5');
  });
});
