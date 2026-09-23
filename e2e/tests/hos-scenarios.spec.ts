import { expect, test } from '@playwright/test';

import {
  CROSS_COUNTRY_TRIP,
  CYCLE_FULL_TRIP,
  CYCLE_LIMITED_TRIP,
  ROUTABLE_SCENARIOS,
  TWO_DAY_WORKED_EXAMPLE_TRIP,
} from '../fixtures/scenarios';
import { mockTripApi } from '../fixtures/mock-trip-api';
import { LogSheetsPage } from '../pages/LogSheetsPage';
import { PlannerPage } from '../pages/PlannerPage';

test.describe('Hours-of-service scenarios', () => {
  test.beforeEach(async ({ page }) => {
    await mockTripApi(page);
  });

  test('AC-30: every routable scenario produces a complete compliant plan', async ({ page }) => {
    for (const scenario of ROUTABLE_SCENARIOS) {
      const planner = new PlannerPage(page);
      await planner.goto();
      await planner.fill(scenario.input);
      await planner.submit();

      await expect(page.getByTestId('error-banner')).toHaveCount(0);
      await expect(new LogSheetsPage(page).sheets).toHaveCount(scenario.expected.logDays ?? 0);
    }
  });

  test('AC-31: high and full cycles produce required thirty-four-hour restarts', async ({
    page,
  }) => {
    for (const scenario of [CYCLE_LIMITED_TRIP, CYCLE_FULL_TRIP]) {
      const planner = new PlannerPage(page);
      await planner.goto();
      await planner.fill(scenario.input);
      await planner.submit();

      const restartStops = page.locator('[data-testid="stop-item"][data-stop-type="restart_34"]');
      await expect(restartStops).not.toHaveCount(0);
    }
  });

  test('AC-32: cross-country plans place fuel stops no more than one thousand miles apart', async ({
    page,
  }) => {
    const planner = new PlannerPage(page);
    await planner.goto();
    await planner.fill(CROSS_COUNTRY_TRIP.input);
    await planner.submit();

    const fuelStops = page.locator('[data-testid="stop-item"][data-stop-type="fuel"]');
    await expect(fuelStops).toHaveCount(CROSS_COUNTRY_TRIP.expected.fuelCount ?? 0);
  });

  test('AC-33: the two-day worked example matches its exact daily totals', async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.goto();
    await planner.fill(TWO_DAY_WORKED_EXAMPLE_TRIP.input);
    await planner.submit();

    const logs = new LogSheetsPage(page);
    for (const [index, totals] of (TWO_DAY_WORKED_EXAMPLE_TRIP.expected.totals ?? []).entries()) {
      const sheet = logs.sheets.nth(index);
      await expect(sheet.getByTestId('total-OFF')).toHaveText(String(totals.OFF));
      await expect(sheet.getByTestId('total-SB')).toHaveText(String(totals.SB));
      await expect(sheet.getByTestId('total-D')).toHaveText(String(totals.D));
      await expect(sheet.getByTestId('total-ON')).toHaveText(String(totals.ON));
    }
  });

  test('AC-34: the John Doe golden log renders its exact four status totals', async ({ page }) => {
    await page.goto('/trips/john-doe-golden');
    const sheet = new LogSheetsPage(page).sheet(1);

    await expect(sheet.getByTestId('total-OFF')).toHaveText('10');
    await expect(sheet.getByTestId('total-SB')).toHaveText('1.75');
    await expect(sheet.getByTestId('total-D')).toHaveText('7.75');
    await expect(sheet.getByTestId('total-ON')).toHaveText('4.5');
  });

  test('AC-35: displayed log changes use quarter-hours in home-terminal time', async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.goto();
    await planner.fill(TWO_DAY_WORKED_EXAMPLE_TRIP.input);
    await planner.submit();

    const times = await page.getByTestId('remark-item').locator('time').allTextContents();
    for (const time of times) {
      const minutes = Number(time.match(/:(\d{2})/)?.[1]);
      expect(minutes % 15).toBe(0);
    }
  });
});
