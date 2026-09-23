import { http, HttpResponse } from 'msw';

import shortDay from '@/test/fixtures/sc1.json';
import twoDay from '@/test/fixtures/sc2.json';
import cycleLimited from '@/test/fixtures/sc3.json';
import cycleFull from '@/test/fixtures/sc4.json';
import crossCountry from '@/test/fixtures/sc5.json';
import unroutable from '@/test/fixtures/sc6.json';
import pickupAtCurrent from '@/test/fixtures/sc7.json';
import { findTripForRequest, type TripRequest } from '@/test/findTripForRequest';

const API = 'http://localhost:8000/api';
const trips = [shortDay, twoDay, cycleLimited, cycleFull, crossCountry, pickupAtCurrent];

export const handlers = [
  http.get(`${API}/health/`, () => HttpResponse.json({ status: 'ok' })),
  http.post(`${API}/trips/`, async ({ request }) => {
    const input = (await request.json()) as TripRequest;
    const trip = findTripForRequest(trips, input);
    return trip
      ? HttpResponse.json(trip, { status: 201 })
      : HttpResponse.json(unroutable, { status: 422 });
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
