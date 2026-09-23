import type { Page } from '@playwright/test';

import { previewTrip } from '../../src/test/previewTrip';

export async function mockTripApi(page: Page) {
  await page.route('**/api/geocode/**', async (route) => {
    const query = new URL(route.request().url()).searchParams.get('q')?.toLowerCase() ?? '';
    const locations = [
      previewTrip.inputs.current,
      previewTrip.inputs.pickup,
      previewTrip.inputs.dropoff,
    ].filter((location) => location.label.toLowerCase().includes(query));
    await route.fulfill({ json: locations });
  });
  await page.route('**/api/trips/**', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({ status: 201, json: previewTrip });
      return;
    }
    await route.fulfill({ json: previewTrip });
  });
}
