import { getTripFormDefaults, tripFormSchema } from '@/features/trip-form/schema';

const selectedLocation = { label: 'Richmond, VA', lat: 37.5407, lng: -77.436 };

describe('trip form schema', () => {
  it('requires selected locations and a valid quarter-hour cycle value', () => {
    const defaults = getTripFormDefaults(new Date('2026-09-24T10:07:00.000Z'), 'America/New_York');

    expect(
      tripFormSchema.safeParse({
        ...defaults,
        current: selectedLocation,
        pickup: selectedLocation,
        dropoff: selectedLocation,
        cycle_used_hrs: 20.25,
      }).success,
    ).toBe(true);
    expect(tripFormSchema.safeParse(defaults).success).toBe(false);
    expect(
      tripFormSchema.safeParse({
        ...defaults,
        current: selectedLocation,
        pickup: selectedLocation,
        dropoff: selectedLocation,
        cycle_used_hrs: 20.1,
      }).success,
    ).toBe(false);
  });

  it('defaults to the next quarter-hour and demo log details', () => {
    const defaults = getTripFormDefaults(new Date('2026-09-24T10:07:00.000Z'), 'America/New_York');

    expect(defaults.start_time).toBe('2026-09-24T06:15');
    expect(defaults.home_timezone).toBe('America/New_York');
    expect(defaults.include_inspections).toBe(true);
    expect(defaults.log_meta).toMatchObject({
      driver_name: 'John Doe',
      carrier_name: "John Doe's Transportation",
      shipping_doc_no: 'BOL-10001',
    });
  });
});
