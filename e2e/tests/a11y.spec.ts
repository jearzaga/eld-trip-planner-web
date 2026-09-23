import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { mockTripApi } from '../fixtures/mock-trip-api';

async function expectNoSeriousViolations(page: Parameters<typeof mockTripApi>[0]) {
  const accessibilityScan = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  const seriousViolations = accessibilityScan.violations.filter(({ impact }) =>
    ['serious', 'critical'].includes(impact ?? ''),
  );

  expect(seriousViolations).toEqual([]);
}

test.describe('Accessibility', () => {
  test('AC-44: planner and results have no serious or critical accessibility violations', async ({
    page,
  }) => {
    await mockTripApi(page);
    await page.goto('/');
    await expectNoSeriousViolations(page);

    await page.getByTestId('btn-sample-trip').click();
    await page.getByTestId('btn-plan-trip').click();
    await expect(page).toHaveURL(/\/trips\//);
    await expectNoSeriousViolations(page);
  });
});
