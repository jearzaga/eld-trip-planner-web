import { expect, test } from '@playwright/test';

import { TWO_DAY_WORKED_EXAMPLE_TRIP } from '../fixtures/scenarios';
import { mockTripApi } from '../fixtures/mock-trip-api';
import { LogSheetsPage } from '../pages/LogSheetsPage';
import { PlannerPage } from '../pages/PlannerPage';

test.describe('Daily log sheets', () => {
  test.beforeEach(async ({ page }) => {
    await mockTripApi(page);
    const planner = new PlannerPage(page);
    await planner.goto();
    await planner.fill(TWO_DAY_WORKED_EXAMPLE_TRIP.input);
    await planner.submit();
  });

  test('AC-20: one log sheet appears for every calendar day in the trip', async ({ page }) => {
    const logs = new LogSheetsPage(page);

    await expect(logs.sheets).toHaveCount(TWO_DAY_WORKED_EXAMPLE_TRIP.expected.logDays ?? 0);
  });

  test('AC-21: each sheet mirrors the complete Drivers Daily Log layout', async ({ page }) => {
    const sheet = new LogSheetsPage(page).sheet(1);

    await expect(sheet).toContainText('Drivers Daily Log');
    await expect(sheet.getByTestId('log-grid')).toBeVisible();
    await expect(sheet).toContainText('Off Duty');
    await expect(sheet).toContainText('Sleeper Berth');
    await expect(sheet).toContainText('Driving');
    await expect(sheet).toContainText('On Duty');
    await expect(sheet).toContainText('70 Hour / 8 Day');
  });

  test('AC-22: the duty line is continuous through every status change', async ({ page }) => {
    const dutyLine = new LogSheetsPage(page).sheet(1).getByTestId('duty-line');

    await expect(dutyLine).toHaveAttribute('d', /^M.+[HV].+[HV].+/);
  });

  test('AC-23: status totals sum to twenty-four hours on every sheet', async ({ page }) => {
    const logs = new LogSheetsPage(page);

    for (let index = 0; index < (TWO_DAY_WORKED_EXAMPLE_TRIP.expected.logDays ?? 0); index += 1) {
      const sheet = logs.sheets.nth(index);
      await expect(sheet.getByTestId('total-sum')).toHaveText('24');
    }
  });

  test('AC-24: log headers include route, mileage, vehicle, and carrier details', async ({
    page,
  }) => {
    const sheet = new LogSheetsPage(page).sheet(1);

    for (const testId of [
      'log-date',
      'log-from',
      'log-to',
      'log-miles-driving',
      'log-total-mileage',
      'log-vehicle-numbers',
      'log-carrier',
      'log-main-office',
      'log-home-terminal',
    ]) {
      await expect(sheet.getByTestId(testId)).not.toBeEmpty();
    }
  });

  test('AC-25: every duty-status change has a City, ST remark and grid marker', async ({
    page,
  }) => {
    const sheet = new LogSheetsPage(page).sheet(1);
    const remarks = sheet.getByTestId('remark-item');

    await expect(remarks.first()).toContainText(/.+, [A-Z]{2}/);
    await expect(remarks).toHaveCount(await sheet.locator('[data-remark-marker]').count());
  });

  test('AC-26: recap values and restart notes are rendered from the trip plan', async ({
    page,
  }) => {
    const sheet = new LogSheetsPage(page).sheet(1);

    await expect(sheet.getByTestId('recap-on-duty-today')).not.toBeEmpty();
    await expect(sheet.getByTestId('recap-a')).not.toBeEmpty();
    await expect(sheet.getByTestId('recap-b')).not.toBeEmpty();
    await expect(sheet.getByTestId('recap-c')).not.toBeEmpty();
  });

  test('AC-27: drivers can page through and print one sheet per page', async ({ page }) => {
    const logs = new LogSheetsPage(page);

    await expect(logs.pager).toBeVisible();
    await logs.nextButton.click();
    await expect(logs.sheet(2)).toBeVisible();
    await page.emulateMedia({ media: 'print' });
    await expect(logs.printButton).toBeHidden();
  });

  test('SC-2 Day 1 matches the approved visual reference', async ({ page }) => {
    const sheet = new LogSheetsPage(page).sheet(1);

    await expect(sheet).toHaveScreenshot('two-day-trip-day-one.png');
  });
});
