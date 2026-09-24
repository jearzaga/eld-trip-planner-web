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
    await planner.currentLocation.focus();

    await expect(page.getByTestId('suggestions-current')).toBeVisible();
    await expect(
      page.getByTestId('suggestions-current').getByTestId('suggestion-item').first(),
    ).toBeVisible();
    await planner.currentLocation.fill('Rich');

    const suggestions = page.getByTestId('suggestions-current');
    await expect(suggestions).toBeVisible();
    await expect(suggestions.getByTestId('suggestion-item')).toContainText(['Richmond, VA']);
  });

  test('selected places update the live route preview before planning', async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.goto();
    const preview = page.getByTestId('route-preview');

    await planner.currentLocation.fill('Rich');
    await expect(preview.getByTestId('preview-current')).toContainText('Rich');
    await expect(preview.getByTestId('preview-current')).toContainText('Select a result');

    await planner.selectLocation('current', TWO_DAY_WORKED_EXAMPLE_TRIP.input.current);
    await planner.selectLocation('pickup', TWO_DAY_WORKED_EXAMPLE_TRIP.input.pickup);
    await planner.selectLocation('dropoff', TWO_DAY_WORKED_EXAMPLE_TRIP.input.dropoff);

    await expect(preview).toContainText('3 of 3 pinned');
    await expect(preview.getByTestId('preview-current')).toContainText('Richmond, VA');
    await expect(preview.getByTestId('preview-pickup')).toContainText('Baltimore, MD');
    await expect(preview.getByTestId('preview-dropoff')).toContainText('Kansas City, MO');
    await expect(preview.getByTestId('route-preview-map')).toBeVisible();
    await expect(preview.locator('[data-testid^="preview-marker-"]')).toHaveCount(3);
    await preview.getByTestId('route-preview-map').scrollIntoViewIfNeeded();
    const mapBounds = await preview.getByTestId('route-preview-map').boundingBox();
    expect(mapBounds).not.toBeNull();
    for (const field of ['current', 'pickup', 'dropoff']) {
      const markerBounds = await preview.getByTestId(`preview-marker-${field}`).boundingBox();
      expect(markerBounds).not.toBeNull();
      expect(markerBounds!.x).toBeGreaterThan(mapBounds!.x);
      expect(markerBounds!.x + markerBounds!.width).toBeLessThan(mapBounds!.x + mapBounds!.width);
      expect(markerBounds!.y).toBeGreaterThan(mapBounds!.y);
      expect(markerBounds!.y + markerBounds!.height).toBeLessThan(mapBounds!.y + mapBounds!.height);
    }
  });

  test('current location asks for device position only after clicking the action', async ({
    page,
    context,
  }) => {
    const planner = new PlannerPage(page);
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 37.5407, longitude: -77.436 });
    await planner.goto();

    await page.getByRole('button', { name: /use my location/i }).click();
    await expect(planner.currentLocation).toHaveValue(/my location/i);
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

    await expect(planner.startTime).toHaveAttribute('type', 'button');
    await expect(planner.startTime).toContainText(/\d{4}/);
    await expect(page.locator('input[type="date"]')).toHaveCount(0);
    await expect(page.getByLabel(/home-terminal time zone/i)).not.toHaveValue('');
    await planner.startTime.click();
    await expect(page.getByRole('grid')).toBeVisible();
  });

  test('calendar selection and time are submitted together', async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.goto();
    await planner.fill(TWO_DAY_WORKED_EXAMPLE_TRIP.input);

    const tripRequest = page.waitForRequest('**/api/trips/');
    await planner.submit();

    expect((await tripRequest).postDataJSON().start_time).toBe(
      TWO_DAY_WORKED_EXAMPLE_TRIP.input.start_time,
    );
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
