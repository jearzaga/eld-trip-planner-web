import { expect, test } from '@playwright/test';

import { CYCLE_LIMITED_TRIP, TWO_DAY_WORKED_EXAMPLE_TRIP } from '../fixtures/scenarios';
import { mockTripApi } from '../fixtures/mock-trip-api';
import { PlannerPage } from '../pages/PlannerPage';
import { ResultsPage } from '../pages/ResultsPage';

const legendLabels = [
  'Start',
  'Pickup',
  'Drop-off',
  'Fuel',
  '30-minute break',
  '10-hour rest',
  '34-hour restart',
];

test.describe('Route results', () => {
  test.beforeEach(async ({ page }) => {
    await mockTripApi(page);
    const planner = new PlannerPage(page);
    await planner.goto();
    await planner.fill(TWO_DAY_WORKED_EXAMPLE_TRIP.input);
    await planner.submit();
  });

  test('AC-10: the route line is drawn and fitted on the map', async ({ page }) => {
    const results = new ResultsPage(page);

    await expect(results.map).toBeVisible();
    await expect(results.routePolyline).toBeVisible();
  });

  test('route instructions list each leg with places, distance, and driving time', async ({
    page,
  }) => {
    const legs = page.getByTestId('route-legs').getByTestId('route-leg');

    await expect(legs).toHaveCount(2);
    await expect(legs.nth(0)).toContainText('Richmond, VA → Baltimore, MD');
    await expect(legs.nth(0)).toContainText('120 mi · 2 h');
    await expect(legs.nth(1)).toContainText('Baltimore, MD → Kansas City, MO');
    await expect(legs.nth(1)).toContainText('1,080 mi · 18 h');
  });

  test('AC-11: the map legend explains every stop type', async ({ page }) => {
    const results = new ResultsPage(page);

    for (const label of legendLabels) {
      await expect(results.mapLegend).toContainText(label);
    }
  });

  test('AC-12: ordered stops show timing and focus the selected map marker', async ({ page }) => {
    const results = new ResultsPage(page);
    const expectedStopTypes = TWO_DAY_WORKED_EXAMPLE_TRIP.expected.stopTypes ?? [];

    await expect(results.stopItems).toHaveCount(expectedStopTypes.length);
    const stops = await results.stopItems.evaluateAll((items) =>
      items.map((item) => ({
        seq: Number(item.getAttribute('data-seq')),
        type: item.getAttribute('data-stop-type'),
      })),
    );
    expect(stops.map(({ type }) => type)).toEqual(expectedStopTypes);
    expect(stops.map(({ seq }) => seq)).toEqual(expectedStopTypes.map((_, index) => index + 1));
    for (const item of await results.stopItems.all()) {
      await expect(item).toContainText(/[A-Z][a-z]{2} \d+, \d+:\d{2} [AP]M → [A-Z][a-z]{2} \d+/);
      await expect(item.getByLabel('Stop duration')).toContainText(/\d+ (h|min)/);
    }

    await results.stopItems.nth(1).click();
    const popup = page.locator('.leaflet-popup-content');
    await expect(popup).toBeVisible();
    await expect(popup).toContainText('30-minute break');
    await expect(popup).toContainText('Stop duration: 30 min');
  });

  test('AC-13: summary reports route, timing, sheets, and stops', async ({ page }) => {
    const results = new ResultsPage(page);

    await expect(results.totalMiles).not.toBeEmpty();
    await expect(results.drivingHours).not.toBeEmpty();
    await expect(results.duration).not.toBeEmpty();
    await expect(results.arrival).not.toBeEmpty();
    await expect(results.logDays).toHaveText('2');
    await expect(results.stopCount).toHaveText('5');
  });
});

test.describe('Route results with every stop type', () => {
  test('AC-11: the map draws a distinct marker for each stop type', async ({ page }) => {
    await mockTripApi(page);
    const planner = new PlannerPage(page);
    await planner.goto();
    await planner.fill(CYCLE_LIMITED_TRIP.input);
    await planner.submit();

    for (const markerType of [
      'start',
      'pickup',
      'fuel',
      'break_30',
      'rest_10',
      'restart_34',
      'dropoff',
    ]) {
      await expect(page.getByTestId(`marker-${markerType}`).first()).toBeVisible();
    }
  });
});
