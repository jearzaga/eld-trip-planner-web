import { http, HttpResponse } from 'msw';

import shortDay from '@/test/fixtures/sc1.json';
import twoDay from '@/test/fixtures/sc2.json';
import cycleLimited from '@/test/fixtures/sc3.json';
import cycleFull from '@/test/fixtures/sc4.json';
import crossCountry from '@/test/fixtures/sc5.json';
import unroutable from '@/test/fixtures/sc6.json';
import pickupAtCurrent from '@/test/fixtures/sc7.json';

const API = 'http://localhost:8000/api';
const trips = [shortDay, twoDay, cycleLimited, cycleFull, crossCountry, pickupAtCurrent];

type TripRequest = {
  current?: { label?: string };
  pickup?: { label?: string };
  dropoff?: { label?: string };
  cycle_used_hrs?: number;
};

function matchesTrip(input: TripRequest, trip: (typeof trips)[number]) {
  return (
    input.current?.label === trip.inputs.current.label &&
    input.pickup?.label === trip.inputs.pickup.label &&
    input.dropoff?.label === trip.inputs.dropoff.label &&
    input.cycle_used_hrs === trip.inputs.cycle_used_hrs
  );
}

export const handlers = [
  http.get(`${API}/health/`, () => HttpResponse.json({ status: 'ok' })),
  http.post(`${API}/trips/`, async ({ request }) => {
    const input = (await request.json()) as TripRequest;
    if (input.pickup?.label === 'Honolulu, HI' && input.dropoff?.label === 'Anchorage, AK') {
      return HttpResponse.json(unroutable, { status: 422 });
    }
    const trip = trips.find((candidate) => matchesTrip(input, candidate));
    return trip
      ? HttpResponse.json(trip, { status: 201 })
      : HttpResponse.json(
          {
            error: {
              code: 'ROUTE_NOT_FOUND',
              message: 'No fixture matches this trip.',
              fields: {},
            },
          },
          { status: 422 },
        );
  }),
  http.get(`${API}/trips/:id/`, ({ params }) => {
    const trip = trips.find((candidate) => candidate.id === params.id);
    return trip
      ? HttpResponse.json(trip)
      : HttpResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Trip not found.', fields: {} } },
          { status: 404 },
        );
  }),
];
