import { expect, test } from '@playwright/test';

import { PlannerPage } from '../pages/PlannerPage';

const apiUrl = process.env.E2E_API_URL;

test.describe('Production smoke', () => {
  test.fixme('DEL-1 ENG-5: @smoke production plans a real trip and renders a log sheet', async ({
    page,
    request,
  }) => {
    expect(apiUrl).toBeTruthy();
    const healthResponse = await request.get(`${apiUrl}/health/`);
    expect(healthResponse.ok()).toBe(true);

    const planner = new PlannerPage(page);
    await planner.goto();
    await planner.sampleTripButton.click();
    await planner.submit();

    await expect(page.getByTestId('log-sheet').first()).toBeVisible();
  });
});
