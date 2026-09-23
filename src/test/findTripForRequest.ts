type LabeledLocation = { label?: string; lat?: number; lng?: number };

export type TripRequest = {
  current?: LabeledLocation;
  pickup?: LabeledLocation;
  dropoff?: LabeledLocation;
  cycle_used_hrs?: number;
};

type PlannedTrip = {
  inputs: {
    current: { label: string };
    pickup: { label: string };
    dropoff: { label: string };
    cycle_used_hrs: number;
  };
};

export function findTripForRequest<Trip extends PlannedTrip>(
  trips: readonly Trip[],
  request: TripRequest,
) {
  return trips.find(
    ({ inputs }) =>
      request.current?.label === inputs.current.label &&
      request.pickup?.label === inputs.pickup.label &&
      request.dropoff?.label === inputs.dropoff.label &&
      request.cycle_used_hrs === inputs.cycle_used_hrs,
  );
}
