import { expect, test } from '@playwright/test';

test.describe('Responsive visual design', () => {
  test.fixme('AC-40: the interface keeps a consistent layout while results load', async ({
    page,
  }) => {
    await page.goto('/');
    const header = page.getByRole('banner');
    const before = await header.boundingBox();
    await page.getByTestId('btn-sample-trip').click();
    await page.getByTestId('btn-plan-trip').click();
    const after = await header.boundingBox();

    expect(after).toEqual(before);
  });

  test.fixme('AC-41: planner and results never scroll horizontally at supported widths', async ({
    page,
  }) => {
    await page.goto('/');
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));

    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
  });
});
