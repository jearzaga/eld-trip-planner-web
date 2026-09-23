import { expect, test } from '@playwright/test';

import { apiUrl } from '../fixtures/api-url';
import { CROSS_COUNTRY_TRIP } from '../fixtures/scenarios';
import { LogSheetsPage } from '../pages/LogSheetsPage';
import { PlannerPage } from '../pages/PlannerPage';
import { ResultsPage } from '../pages/ResultsPage';

const savedTripUrl = /\/trips\/([0-9a-f]{24})$/;

async function expectPlannedTripRendered(results: ResultsPage, logs: LogSheetsPage) {
  await expect(results.map).toBeVisible();
  await expect(results.routePolyline).toBeVisible();
  await expect(results.stopItems.first()).toBeVisible();

  const firstSheet = logs.sheets.first();
  await expect(firstSheet).toBeVisible();
  await expect(firstSheet.getByTestId('log-date')).not.toBeEmpty();
  await expect(firstSheet.getByTestId('log-from')).not.toBeEmpty();
  await expect(firstSheet.getByTestId('log-to')).not.toBeEmpty();
  await expect(firstSheet.getByTestId('log-miles-driving')).toHaveText(/\d/);

  const totals = await Promise.all(
    ['OFF', 'SB', 'D', 'ON'].map(async (status) =>
      Number(await firstSheet.getByTestId(`total-${status}`).textContent()),
    ),
  );
  expect(totals.reduce((sum, hours) => sum + hours, 0)).toBe(24);
}

test.describe('Full system against the real API', () => {
  // AC-45
  test('plans the sample trip through the API and reloads the saved plan from its link', async ({
    page,
  }) => {
    const planner = new PlannerPage(page);
    const results = new ResultsPage(page);
    const logs = new LogSheetsPage(page);

    await planner.goto();
    await planner.sampleTripButton.click();
    await planner.submit();

    await expect(page).toHaveURL(savedTripUrl);
    const plannedUrl = page.url();
    await expectPlannedTripRendered(results, logs);
    const firstSheetHeader = await logs.sheets.first().getByTestId('log-from').textContent();

    await page.reload();

    expect(page.url()).toBe(plannedUrl);
    await expectPlannedTripRendered(results, logs);
    await expect(logs.sheets.first().getByTestId('log-from')).toHaveText(firstSheetHeader ?? '');
  });

  // SC-5
  test('draws one log sheet per day the API planned for a multi-day trip', async ({
    page,
    request,
  }) => {
    const planner = new PlannerPage(page);
    const logs = new LogSheetsPage(page);

    await planner.goto();
    await planner.fill(CROSS_COUNTRY_TRIP.input);
    await planner.submit();

    await expect(page).toHaveURL(savedTripUrl);
    const tripId = page.url().match(savedTripUrl)?.[1];
    const savedTrip = await request.get(`${apiUrl}/trips/${tripId}/`);
    expect(savedTrip.ok()).toBe(true);
    const { daily_logs: dailyLogs } = (await savedTrip.json()) as { daily_logs: unknown[] };

    expect(dailyLogs.length).toBeGreaterThan(1);
    await expect(logs.sheets).toHaveCount(dailyLogs.length);
  });
});
