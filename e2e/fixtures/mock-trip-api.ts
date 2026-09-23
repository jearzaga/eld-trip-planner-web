import type { Page } from '@playwright/test';

import type { TripPlan } from '../../src/features/trip-results/schema';
import { previewTrip } from '../../src/test/previewTrip';
import { ALL_SCENARIOS, type LocationInput } from './scenarios';

type TripRequest = {
  current: LocationInput;
  pickup: LocationInput;
  dropoff: LocationInput;
  cycle_used_hrs: number;
};

const geocodeLocations = Array.from(
  new Map(
    ALL_SCENARIOS.flatMap(({ input }) => [input.current, input.pickup, input.dropoff]).map(
      (location) => [location.label, location],
    ),
  ).values(),
);

function setLogDays(trip: TripPlan, count: number) {
  const seeds = trip.daily_logs;
  trip.daily_logs = Array.from({ length: count }, (_, index) => {
    const source = structuredClone(seeds[Math.min(index, seeds.length - 1)]);
    const day = 24 + index;
    return { ...source, day_number: index + 1, date: `2026-09-${String(day).padStart(2, '0')}` };
  });
  trip.summary.log_days = count;
}

function resequenceStops(trip: TripPlan) {
  trip.stops = trip.stops.map((stop, index) => ({ ...stop, seq: index + 1 }));
  trip.summary.stop_count = trip.stops.length;
}

function tripForRequest(input: TripRequest) {
  const trip = structuredClone(previewTrip) as unknown as TripPlan;
  trip.inputs.current = input.current;
  trip.inputs.pickup = input.pickup;
  trip.inputs.dropoff = input.dropoff;
  trip.inputs.cycle_used_hrs = input.cycle_used_hrs;

  if (input.cycle_used_hrs === 65) {
    setLogDays(trip, 4);
    trip.stops.unshift({
      ...trip.stops[1],
      type: 'restart_34',
      label: 'Cycle restart near Columbus, OH',
      duration_min: 2040,
      status: 'OFF',
    });
  } else if (input.cycle_used_hrs === 70) {
    setLogDays(trip, 2);
    trip.stops.unshift({
      ...trip.stops[1],
      type: 'restart_34',
      label: 'Starting-cycle restart in Richmond, VA',
      duration_min: 2040,
      status: 'OFF',
    });
  } else if (input.dropoff.label === 'Los Angeles, CA') {
    setLogDays(trip, 5);
    const fuel = trip.stops.find((stop) => stop.type === 'fuel')!;
    trip.stops = [
      ...trip.stops.filter((stop) => stop.type !== 'fuel'),
      { ...fuel, label: 'Fuel stop near St. Louis, MO' },
      { ...fuel, label: 'Fuel stop near Albuquerque, NM', lng: -106.6504, lat: 35.0844 },
    ];
  } else if (input.dropoff.label === 'Philadelphia, PA') {
    setLogDays(trip, 1);
  }

  resequenceStops(trip);
  return trip;
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

export async function mockTripApi(page: Page) {
  let plannedTrip = structuredClone(previewTrip) as unknown as TripPlan;

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
      plannedTrip = tripForRequest(input);
      await route.fulfill({ status: 201, json: plannedTrip });
      return;
    }
    const response = route.request().url().includes('john-doe-golden')
      ? johnDoeTrip()
      : plannedTrip;
    await route.fulfill({ json: response });
  });
}
