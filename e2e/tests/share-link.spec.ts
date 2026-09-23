import { expect, test } from '@playwright/test';

import { ResultsPage } from '../pages/ResultsPage';

test.describe('Shareable trip', () => {
  test.fixme('AC-45: a copied trip URL reloads the same saved plan', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const results = new ResultsPage(page);
    await results.goto('saved-trip-id');
    await results.copyLinkButton.click();

    const sharedUrl = await page.evaluate(() => navigator.clipboard.readText());
    await page.goto(sharedUrl);

    await expect(results.map).toBeVisible();
    await expect(results.logDays).not.toBeEmpty();
  });
});
