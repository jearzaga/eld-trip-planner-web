import { z } from 'zod';

export const locationSchema = z.object(
  {
    label: z.string().min(1),
    lat: z.number(),
    lng: z.number(),
  },
  { error: 'Select a location from the list.' },
);

const requiredLogField = z.string().trim().min(1, 'Required on the daily log.');

function isValidStartTime(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return false;
  const [, year, month, day, hour, minute] = match.map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day &&
    hour < 24 &&
    minute < 60 &&
    minute % 15 === 0
  );
}

export const logMetaSchema = z.object({
  driver_name: requiredLogField,
  co_driver_name: z.string(),
  carrier_name: requiredLogField,
  main_office_address: requiredLogField,
  home_terminal_address: requiredLogField,
  truck_tractor_no: requiredLogField,
  trailer_no: requiredLogField,
  shipping_doc_no: requiredLogField,
  shipper_commodity: requiredLogField,
});

export const tripFormSchema = z.object({
  current: locationSchema,
  pickup: locationSchema,
  dropoff: locationSchema,
  cycle_used_hrs: z
    .number()
    .min(0, 'Cycle used must be between 0 and 70 hours.')
    .max(70, 'Cycle used must be between 0 and 70 hours.')
    .refine((value) => Number.isInteger(value * 4), 'Use quarter-hour increments.'),
  start_time: z
    .string()
    .refine(isValidStartTime, 'Choose a valid date and a time on a 15-minute mark.'),
  home_timezone: z.string().min(1, 'Choose a home-terminal time zone.'),
  include_inspections: z.boolean(),
  log_meta: logMetaSchema,
});

export type LocationOption = z.infer<typeof locationSchema>;
export type TripFormValues = z.infer<typeof tripFormSchema>;
export type TripFormDefaults = Omit<TripFormValues, 'current' | 'pickup' | 'dropoff'> & {
  current?: LocationOption;
  pickup?: LocationOption;
  dropoff?: LocationOption;
};

const FIFTEEN_MINUTES = 15 * 60 * 1000;

function formatLocalDateTime(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${value.year}-${value.month}-${value.day}T${value.hour}:${value.minute}`;
}

export function getTripFormDefaults(
  now = new Date(),
  timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York',
): TripFormDefaults {
  const nextQuarterHour = new Date(Math.ceil(now.getTime() / FIFTEEN_MINUTES) * FIFTEEN_MINUTES);

  return {
    current: undefined,
    pickup: undefined,
    dropoff: undefined,
    cycle_used_hrs: 0,
    start_time: formatLocalDateTime(nextQuarterHour, timeZone),
    home_timezone: timeZone,
    include_inspections: true,
    log_meta: {
      driver_name: 'John Doe',
      co_driver_name: '',
      carrier_name: "John Doe's Transportation",
      main_office_address: 'Washington, D.C.',
      home_terminal_address: 'Richmond, VA',
      truck_tractor_no: '123',
      trailer_no: '456',
      shipping_doc_no: 'BOL-10001',
      shipper_commodity: 'ACME Co. — paper products',
    },
  };
}

export function getSampleTripValues(defaults: TripFormDefaults): TripFormValues {
  return {
    ...defaults,
    current: { label: 'Richmond, VA', lat: 37.5407, lng: -77.436 },
    pickup: { label: 'Baltimore, MD', lat: 39.2904, lng: -76.6122 },
    dropoff: { label: 'Kansas City, MO', lat: 39.0997, lng: -94.5786 },
    cycle_used_hrs: 20,
  };
}
