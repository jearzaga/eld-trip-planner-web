import { http, HttpResponse } from 'msw';

import { server } from '@/test/server';

import { planTrip } from './api';
import { getSampleTripValues, getTripFormDefaults } from './schema';

describe('planTrip', () => {
  it('retries one transient server failure before returning the trip', async () => {
    let attempts = 0;
    server.use(
      http.post('http://localhost:8000/api/trips/', () => {
        attempts += 1;
        return attempts === 1
          ? HttpResponse.json(
              { error: { code: 'SERVER_UNAVAILABLE', message: 'Server is waking up.' } },
              { status: 503 },
            )
          : HttpResponse.json({ id: 'trip-after-retry' }, { status: 201 });
      }),
    );

    const result = await planTrip(getSampleTripValues(getTripFormDefaults()));

    expect(result).toEqual({ id: 'trip-after-retry' });
    expect(attempts).toBe(2);
  });

  it('does not retry validation failures', async () => {
    let attempts = 0;
    server.use(
      http.post('http://localhost:8000/api/trips/', () => {
        attempts += 1;
        return HttpResponse.json(
          { error: { code: 'INVALID_TRIP', message: 'Check the trip details.' } },
          { status: 422 },
        );
      }),
    );

    await expect(planTrip(getSampleTripValues(getTripFormDefaults()))).rejects.toMatchObject({
      status: 422,
    });
    expect(attempts).toBe(1);
  });
});
