export type LocationInput = {
  label: string;
  lat: number;
  lng: number;
};

export type TripInput = {
  current: LocationInput;
  pickup: LocationInput;
  dropoff: LocationInput;
  cycle_used_hrs: number;
  start_time: string;
  home_timezone: string;
};

type DailyTotals = {
  OFF: number;
  SB: number;
  D: number;
  ON: number;
};

export type Scenario = {
  specId: string;
  name: string;
  input: TripInput;
  expected: {
    logDays?: number;
    totals?: DailyTotals[];
    stopTypes?: string[];
    restartCount?: number;
    firstStop?: string;
    fuelCount?: number;
    restCount?: number;
    breakCount?: number;
    status?: number;
    errorCode?: string;
    pickupArriveAt?: string;
  };
};

const RICHMOND = { label: 'Richmond, VA', lat: 37.5407, lng: -77.436 };
const FREDERICKSBURG = { label: 'Fredericksburg, VA', lat: 38.3032, lng: -77.4605 };
const PHILADELPHIA = { label: 'Philadelphia, PA', lat: 39.9526, lng: -75.1652 };
const BALTIMORE = { label: 'Baltimore, MD', lat: 39.2904, lng: -76.6122 };
const KANSAS_CITY = { label: 'Kansas City, MO', lat: 39.0997, lng: -94.5786 };
const CHARLOTTE = { label: 'Charlotte, NC', lat: 35.2271, lng: -80.8431 };
const LOS_ANGELES = { label: 'Los Angeles, CA', lat: 34.0522, lng: -118.2437 };
const HONOLULU = { label: 'Honolulu, HI', lat: 21.3069, lng: -157.8583 };
const ANCHORAGE = { label: 'Anchorage, AK', lat: 61.2181, lng: -149.9003 };

const START_TIME = '2026-09-24T06:00';
const HOME_TIMEZONE = 'America/New_York';

function tripInput(
  current: LocationInput,
  pickup: LocationInput,
  dropoff: LocationInput,
  cycleUsedHours: number,
): TripInput {
  return {
    current,
    pickup,
    dropoff,
    cycle_used_hrs: cycleUsedHours,
    start_time: START_TIME,
    home_timezone: HOME_TIMEZONE,
  };
}

export const SHORT_DAY_TRIP: Scenario = {
  specId: 'SC-1',
  name: 'short day',
  input: tripInput(RICHMOND, FREDERICKSBURG, PHILADELPHIA, 0),
  expected: {
    logDays: 1,
    totals: [{ OFF: 17.5, SB: 0, D: 4, ON: 2.5 }],
    stopTypes: ['pickup', 'dropoff'],
  },
};

export const TWO_DAY_WORKED_EXAMPLE_TRIP: Scenario = {
  specId: 'SC-2',
  name: 'two-day worked example',
  input: tripInput(RICHMOND, BALTIMORE, KANSAS_CITY, 20),
  expected: {
    logDays: 2,
    totals: [
      { OFF: 6.5, SB: 5.25, D: 11, ON: 1.25 },
      { OFF: 8.5, SB: 4.75, D: 9, ON: 1.75 },
    ],
    stopTypes: ['pickup', 'break_30', 'rest_10', 'fuel', 'dropoff'],
  },
};

export const CYCLE_LIMITED_TRIP: Scenario = {
  specId: 'SC-3',
  name: 'cycle-limited trip',
  input: tripInput(RICHMOND, BALTIMORE, KANSAS_CITY, 65),
  expected: { logDays: 4, restartCount: 1 },
};

export const CYCLE_FULL_TRIP: Scenario = {
  specId: 'SC-4',
  name: 'full starting cycle',
  input: tripInput(RICHMOND, FREDERICKSBURG, PHILADELPHIA, 70),
  expected: {
    logDays: 2,
    totals: [{ OFF: 24, SB: 0, D: 0, ON: 0 }],
    firstStop: 'restart_34',
  },
};

export const CROSS_COUNTRY_TRIP: Scenario = {
  specId: 'SC-5',
  name: 'cross-country trip',
  input: tripInput(RICHMOND, CHARLOTTE, LOS_ANGELES, 10),
  expected: { logDays: 5, fuelCount: 2, restCount: 4, breakCount: 2 },
};

export const UNROUTABLE_TRIP: Scenario = {
  specId: 'SC-6',
  name: 'unroutable trip',
  input: tripInput(RICHMOND, HONOLULU, ANCHORAGE, 0),
  expected: { status: 422, errorCode: 'ROUTE_NOT_FOUND' },
};

export const PICKUP_AT_CURRENT_LOCATION_TRIP: Scenario = {
  specId: 'SC-7',
  name: 'pickup at current location',
  input: tripInput(RICHMOND, RICHMOND, PHILADELPHIA, 0),
  expected: { logDays: 1, pickupArriveAt: '2026-09-24T06:15:00-04:00' },
};

export const ROUTABLE_SCENARIOS = [
  SHORT_DAY_TRIP,
  TWO_DAY_WORKED_EXAMPLE_TRIP,
  CYCLE_LIMITED_TRIP,
  CYCLE_FULL_TRIP,
  CROSS_COUNTRY_TRIP,
  PICKUP_AT_CURRENT_LOCATION_TRIP,
];

export const ALL_SCENARIOS = [...ROUTABLE_SCENARIOS, UNROUTABLE_TRIP];
