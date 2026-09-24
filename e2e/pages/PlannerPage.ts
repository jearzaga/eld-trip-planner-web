import type { Locator, Page } from '@playwright/test';

import type { LocationInput, TripInput } from '../fixtures/scenarios';

export class PlannerPage {
  readonly page: Page;
  readonly form: Locator;
  readonly currentLocation: Locator;
  readonly pickupLocation: Locator;
  readonly dropoffLocation: Locator;
  readonly cycleUsed: Locator;
  readonly startTime: Locator;
  readonly inspections: Locator;
  readonly logDetails: Locator;
  readonly sampleTripButton: Locator;
  readonly planTripButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.form = page.getByTestId('trip-form');
    this.currentLocation = page.getByTestId('input-current');
    this.pickupLocation = page.getByTestId('input-pickup');
    this.dropoffLocation = page.getByTestId('input-dropoff');
    this.cycleUsed = page.getByTestId('input-cycle-used');
    this.startTime = page.getByTestId('input-start-time');
    this.inspections = page.getByTestId('toggle-inspections');
    this.logDetails = page.getByTestId('log-details');
    this.sampleTripButton = page.getByTestId('btn-sample-trip');
    this.planTripButton = page.getByTestId('btn-plan-trip');
  }

  async goto() {
    await this.page.goto('/');
  }

  async selectLocation(field: 'current' | 'pickup' | 'dropoff', location: LocationInput) {
    const input = this.page.getByTestId(`input-${field}`);
    await input.fill(location.label);
    await this.page
      .getByTestId(`suggestions-${field}`)
      .getByTestId('suggestion-item')
      .filter({ hasText: location.label })
      .click();
  }

  async fill(input: TripInput) {
    await this.selectLocation('current', input.current);
    await this.selectLocation('pickup', input.pickup);
    await this.selectLocation('dropoff', input.dropoff);
    await this.cycleUsed.fill(String(input.cycle_used_hrs));
    const [date = '', time = ''] = input.start_time.split('T');
    const [year = '', month = '', day = ''] = date.split('-');
    const monthName = new Date(Number(year), Number(month) - 1).toLocaleString('en-US', {
      month: 'long',
    });
    await this.startTime.click();
    await this.page.getByRole('combobox', { name: 'Choose the Year' }).selectOption(year);
    await this.page
      .getByRole('combobox', { name: 'Choose the Month' })
      .selectOption(String(Number(month) - 1));
    await this.page
      .getByRole('button', {
        name: new RegExp(`${monthName} ${Number(day)}(?:st|nd|rd|th), ${year}`),
      })
      .click();
    await this.page.getByTestId('input-start-clock').fill(time);
  }

  async submit() {
    await this.planTripButton.click();
  }
}
