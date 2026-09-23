import { expect, test } from '@playwright/test';

import { TWO_DAY_WORKED_EXAMPLE_TRIP, UNROUTABLE_TRIP } from '../fixtures/scenarios';
import { PlannerPage } from '../pages/PlannerPage';

test.describe('Loading and recovery', () => {
  test.fixme('AC-42: planning shows staged progress and stable result skeletons', async ({
    page,
  }) => {
    const planner = new PlannerPage(page);
    await planner.goto();
    await planner.fill(TWO_DAY_WORKED_EXAMPLE_TRIP.input);
    await planner.submit();

    const loader = page.getByTestId('planning-loader');
    await expect(loader).toBeVisible();
    await expect(loader).toContainText(/routing|hours-of-service|drawing logs/i);
  });

  test.fixme('AC-43: route and network errors preserve input and offer recovery', async ({
    page,
  }) => {
    const planner = new PlannerPage(page);
    await planner.goto();
    await planner.fill(UNROUTABLE_TRIP.input);
    await planner.submit();

    await expect(page.getByTestId('error-banner')).toContainText(/route/i);
    await expect(page.getByTestId('error-retry')).toBeVisible();
    await expect(planner.currentLocation).toHaveValue(UNROUTABLE_TRIP.input.current.label);
  });
});
