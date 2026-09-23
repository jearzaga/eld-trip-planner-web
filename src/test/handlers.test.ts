import canonicalTrip from '@/test/fixtures/sc2.json';
import unroutableTrip from '@/test/fixtures/sc6.json';

import { api } from '@/lib/api/client';

describe('canonical fixture handlers', () => {
  it('serves the two-day trip and allows its shared link to reload', async () => {
    const created = await api.post('/trips/', canonicalTrip.inputs);
    const reloaded = await api.get(`/trips/${canonicalTrip.id}/`);

    expect(created.status).toBe(201);
    expect(created.data).toEqual(canonicalTrip);
    expect(reloaded.data).toEqual(canonicalTrip);
  });

  it('serves the canonical unroutable error', async () => {
    const response = api.post('/trips/', {
      current: { label: 'Richmond, VA', lat: 37.5407, lng: -77.436 },
      pickup: { label: 'Honolulu, HI', lat: 21.3069, lng: -157.8583 },
      dropoff: { label: 'Anchorage, AK', lat: 61.2181, lng: -149.9003 },
      cycle_used_hrs: 0,
    });

    await expect(response).rejects.toMatchObject({
      status: 422,
      code: unroutableTrip.error.code,
    });
  });
});
