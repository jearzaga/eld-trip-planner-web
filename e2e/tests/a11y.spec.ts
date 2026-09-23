import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('Accessibility', () => {
  test.fixme('AC-44: planner and results have no serious or critical accessibility violations', async ({
    page,
  }) => {
    await page.goto('/');
    const accessibilityScan = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    const seriousViolations = accessibilityScan.violations.filter(({ impact }) =>
      ['serious', 'critical'].includes(impact ?? ''),
    );

    expect(seriousViolations).toEqual([]);
  });
});
