import { expect, test } from '@playwright/test';

import { TWO_DAY_WORKED_EXAMPLE_TRIP } from '../fixtures/scenarios';
import { PlannerPage } from '../pages/PlannerPage';

test.describe('Server cold start', () => {
  test.fixme('AC-46: a delayed server shows a wake message and planning succeeds without manual retry', async ({
    page,
  }) => {
    await page.route('**/api/health/', async (route) => {
      const response = await route.fetch();
      await new Promise((resolve) => setTimeout(resolve, 5_000));
      await route.fulfill({ response });
    });

    const planner = new PlannerPage(page);
    await planner.goto();
    await expect(page.getByTestId('wake-banner')).toContainText(/waking up the server/i);
    await planner.fill(TWO_DAY_WORKED_EXAMPLE_TRIP.input);
    await planner.submit();

    await expect(page).toHaveURL(/\/trips\//);
  });
});
