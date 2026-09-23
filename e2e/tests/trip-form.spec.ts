import { expect, test } from '@playwright/test';

import { TWO_DAY_WORKED_EXAMPLE_TRIP } from '../fixtures/scenarios';
import { PlannerPage } from '../pages/PlannerPage';

test.describe('Trip form', () => {
  test.fixme('AC-01: locations use debounced autocomplete and require a selection', async ({
    page,
  }) => {
    const planner = new PlannerPage(page);
    await planner.goto();
    await planner.currentLocation.fill('Rich');

    const suggestions = page.getByTestId('suggestions-current');
    await expect(suggestions).toBeVisible();
    await expect(suggestions.getByTestId('suggestion-item')).toContainText(['Richmond, VA']);
  });

  test.fixme('AC-02: cycle usage validates quarter-hours from zero through seventy', async ({
    page,
  }) => {
    const planner = new PlannerPage(page);
    await planner.goto();
    await planner.cycleUsed.fill('70.25');
    await planner.submit();

    await expect(page.getByText(/between 0 and 70 hours/i)).toBeVisible();
  });

  test.fixme('AC-03: start time and home-terminal timezone have defaults', async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.goto();

    await expect(planner.startTime).not.toHaveValue('');
    await expect(page.getByLabel(/home-terminal time zone/i)).not.toHaveValue('');
  });

  test.fixme('AC-04: optional log details are prefilled with demo values', async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.goto();
    await planner.logDetails.click();

    await expect(page.getByLabel(/driver/i)).not.toHaveValue('');
    await expect(page.getByLabel(/carrier/i)).not.toHaveValue('');
    await expect(page.getByLabel(/shipping document/i)).not.toHaveValue('');
  });

  test.fixme('AC-05: sample trip fills a known multi-day route', async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.goto();
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
});
