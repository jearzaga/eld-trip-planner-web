import { expect, test } from '@playwright/test';

import { mockTripApi } from '../fixtures/mock-trip-api';

test.describe('Responsive visual design', () => {
  test('AC-40: the interface keeps a consistent layout while results load', async ({ page }) => {
    await mockTripApi(page, { planningDelayMs: 1_000 });
    await page.goto('/');
    const header = page.getByRole('banner');
    const before = await header.boundingBox();
    await page.getByTestId('btn-sample-trip').click();
    await page.getByTestId('btn-plan-trip').click();
    const after = await header.boundingBox();

    expect(after?.width).toBe(before?.width);
    expect(after?.height).toBe(before?.height);
  });

  test('AC-41: planner and results never scroll horizontally at supported widths', async ({
    page,
  }) => {
    await mockTripApi(page);
    for (const width of [375, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      const plannerDimensions = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        content: document.documentElement.scrollWidth,
      }));
      expect(plannerDimensions.content).toBeLessThanOrEqual(plannerDimensions.viewport);

      await page.getByTestId('btn-sample-trip').click();
      await page.getByTestId('btn-plan-trip').click();
      await expect(page).toHaveURL(/\/trips\//);
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
      const resultsDimensions = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        content: document.documentElement.scrollWidth,
      }));
      expect(resultsDimensions.content).toBeLessThanOrEqual(resultsDimensions.viewport);
    }
  });
});
