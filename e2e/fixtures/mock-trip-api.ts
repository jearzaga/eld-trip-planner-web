import type { Page } from '@playwright/test';

import type { TripPlan } from '../../src/features/trip-results/schema';
import { previewTrip } from '../../src/test/previewTrip';
import shortDay from './responses/sc1.json' with { type: 'json' };
import twoDay from './responses/sc2.json' with { type: 'json' };
import cycleLimited from './responses/sc3.json' with { type: 'json' };
import cycleFull from './responses/sc4.json' with { type: 'json' };
import crossCountry from './responses/sc5.json' with { type: 'json' };
import unroutable from './responses/sc6.json' with { type: 'json' };
import pickupAtCurrent from './responses/sc7.json' with { type: 'json' };
import { ALL_SCENARIOS, ROUTABLE_SCENARIOS, type LocationInput } from './scenarios';

type TripRequest = {
  current: LocationInput;
  pickup: LocationInput;
  dropoff: LocationInput;
  cycle_used_hrs: number;
};

type MockTripApiOptions = {
  planningDelayMs?: number;
};

const geocodeLocations = Array.from(
  new Map(
    ALL_SCENARIOS.flatMap(({ input }) => [input.current, input.pickup, input.dropoff]).map(
      (location) => [location.label, location],
    ),
  ).values(),
);

const canonicalTrips: Record<string, unknown> = {
  'SC-1': shortDay,
  'SC-2': twoDay,
  'SC-3': cycleLimited,
  'SC-4': cycleFull,
  'SC-5': crossCountry,
  'SC-7': pickupAtCurrent,
};

export function tripForScenarioInput(input: TripRequest) {
  const scenario = ROUTABLE_SCENARIOS.find(
    ({ input: expected }) =>
      input.current.label === expected.current.label &&
      input.pickup.label === expected.pickup.label &&
      input.dropoff.label === expected.dropoff.label &&
      input.cycle_used_hrs === expected.cycle_used_hrs,
  );
  return scenario ? (canonicalTrips[scenario.specId] as TripPlan) : undefined;
}

function johnDoeTrip() {
  const trip = structuredClone(previewTrip) as unknown as TripPlan;
  const log = trip.daily_logs[0];
  log.date = '2026-09-24';
  log.header.from = 'Richmond, VA';
  log.header.to = 'Newark, NJ';
  log.segments = [
    { status: 'OFF', start_min: 0, end_min: 360 },
    { status: 'ON', start_min: 360, end_min: 450, note: 'Reported, loaded, pre-trip' },
    { status: 'D', start_min: 450, end_min: 540 },
    { status: 'ON', start_min: 540, end_min: 570, note: 'Fueled' },
    { status: 'D', start_min: 570, end_min: 720 },
    { status: 'OFF', start_min: 720, end_min: 780, note: 'Lunch' },
    { status: 'D', start_min: 780, end_min: 900 },
    { status: 'ON', start_min: 900, end_min: 930, note: 'Delivery' },
    { status: 'D', start_min: 930, end_min: 960 },
    { status: 'SB', start_min: 960, end_min: 1065, note: 'Sleeper berth' },
    { status: 'D', start_min: 1065, end_min: 1140 },
    { status: 'ON', start_min: 1140, end_min: 1260, note: 'Post-trip, paperwork' },
    { status: 'OFF', start_min: 1260, end_min: 1440 },
  ];
  log.totals = { OFF: 10, SB: 1.75, D: 7.75, ON: 4.5 };
  log.remarks = [
    { at_min: 360, location: 'Richmond, VA', note: 'Reported, loaded, pre-trip' },
    { at_min: 450, location: 'Richmond, VA', note: 'Depart' },
    { at_min: 540, location: 'Fredericksburg, VA', note: 'Fueled' },
    { at_min: 570, location: 'Fredericksburg, VA', note: 'Resume driving' },
    { at_min: 720, location: 'Baltimore, MD', note: 'Lunch' },
    { at_min: 780, location: 'Baltimore, MD', note: 'Resume driving' },
    { at_min: 900, location: 'Philadelphia, PA', note: 'Delivery' },
    { at_min: 930, location: 'Philadelphia, PA', note: 'Resume driving' },
    { at_min: 960, location: 'Cherry Hill, NJ', note: 'Sleeper berth' },
    { at_min: 1065, location: 'Cherry Hill, NJ', note: 'Resume driving' },
    { at_min: 1140, location: 'Newark, NJ', note: 'Post-trip, paperwork' },
    { at_min: 1260, location: 'Newark, NJ', note: 'Off duty' },
  ];
  trip.daily_logs = [log];
  trip.summary.log_days = 1;
  return trip;
}

export async function mockTripApi(page: Page, options: MockTripApiOptions = {}) {
  let plannedTrip = twoDay as unknown as TripPlan;

  await page.route('**/api/health/', (route) =>
    route.fulfill({ status: 200, json: { status: 'ok' } }),
  );
  await page.route('**/api/geocode/**', async (route) => {
    const query = new URL(route.request().url()).searchParams.get('q')?.toLowerCase() ?? '';
    const locations = geocodeLocations.filter((location) =>
      location.label.toLowerCase().includes(query),
    );
    await route.fulfill({ json: locations });
  });
  await page.route('**/api/trips/**', async (route) => {
    if (route.request().method() === 'POST') {
      const input = route.request().postDataJSON() as TripRequest;
      if (input.pickup.label === 'Honolulu, HI' && input.dropoff.label === 'Anchorage, AK') {
        await route.fulfill({
          status: 422,
          json: unroutable,
        });
        return;
      }
      if (options.planningDelayMs) {
        await new Promise((resolve) => setTimeout(resolve, options.planningDelayMs));
      }
      const trip = tripForScenarioInput(input);
      if (!trip) {
        await route.fulfill({ status: 422, json: unroutable });
        return;
      }
      plannedTrip = trip;
      await route.fulfill({ status: 201, json: plannedTrip });
      return;
    }
    const response = route.request().url().includes('john-doe-golden')
      ? johnDoeTrip()
      : plannedTrip;
    await route.fulfill({ json: response });
  });
}
