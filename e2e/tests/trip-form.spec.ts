import { expect, test } from '@playwright/test';

import { TWO_DAY_WORKED_EXAMPLE_TRIP } from '../fixtures/scenarios';
import { PlannerPage } from '../pages/PlannerPage';

test.describe('Trip form', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/geocode/**', async (route) => {
      const query = new URL(route.request().url()).searchParams.get('q')?.toLowerCase() ?? '';
      const locations = [
        { label: 'Richmond, VA', lat: 37.5407, lng: -77.436 },
        { label: 'Baltimore, MD', lat: 39.2904, lng: -76.6122 },
        { label: 'Kansas City, MO', lat: 39.0997, lng: -94.5786 },
      ].filter((location) => location.label.toLowerCase().includes(query));

      await route.fulfill({ json: locations });
    });
    await page.route('**/api/trips/', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 400));
      await route.fulfill({ status: 201, json: { id: '65f0a1b2c3d4e5f6a7b8c9d0' } });
    });
  });

  test('AC-01: locations use debounced autocomplete and require a selection', async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.goto();
    await planner.currentLocation.fill('Rich');

    const suggestions = page.getByTestId('suggestions-current');
    await expect(suggestions).toBeVisible();
    await expect(suggestions.getByTestId('suggestion-item')).toContainText(['Richmond, VA']);
  });

  test('AC-02: cycle usage validates quarter-hours from zero through seventy', async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.goto();
    await planner.cycleUsed.fill('70.25');
    await planner.submit();

    await expect(page.getByText(/between 0 and 70 hours/i)).toBeVisible();
  });

  test('AC-03: start time and home-terminal timezone have defaults', async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.goto();

    await expect(planner.startTime).not.toHaveValue('');
    await expect(page.getByLabel(/home-terminal time zone/i)).not.toHaveValue('');
  });

  test('AC-04: optional log details are prefilled with demo values', async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.goto();
    await planner.logDetails.click();

    await expect(page.getByLabel(/^driver name$/i)).not.toHaveValue('');
    await expect(page.getByLabel(/carrier/i)).not.toHaveValue('');
    await expect(page.getByLabel(/shipping document/i)).not.toHaveValue('');
  });

  test('AC-05: sample trip fills a known multi-day route', async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.goto();
    await expect(planner.sampleTripButton).toHaveText('Try a sample trip');
    await planner.sampleTripButton.click();

    await expect(planner.currentLocation).toHaveValue(
      TWO_DAY_WORKED_EXAMPLE_TRIP.input.current.label,
    );
    await expect(planner.pickupLocation).toHaveValue(
      TWO_DAY_WORKED_EXAMPLE_TRIP.input.pickup.label,
    );
    await expect(planner.dropoffLocation).toHaveValue(
      TWO_DAY_WORKED_EXAMPLE_TRIP.input.dropoff.label,
    );
    await expect(planner.cycleUsed).toHaveValue('20');
  });

  test('W6-08: submitting shows progress and opens the created trip', async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.goto();
    await planner.sampleTripButton.click();
    await planner.submit();

    await expect(page.getByTestId('planning-loader')).toContainText('Routing your trip');
    await expect(page).toHaveURL(/\/trips\/65f0a1b2c3d4e5f6a7b8c9d0$/);
  });
});
