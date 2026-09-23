import { expect, test } from '@playwright/test';

import { ALL_SCENARIOS } from '../fixtures/scenarios';

const apiUrl = process.env.E2E_API_URL ?? 'http://localhost:8000/api';

type TripResponseBody = {
  error?: { code: string };
  daily_logs?: Array<{ totals: Record<string, number> }>;
  stops?: Array<{ type: string; arrive_at: string }>;
};

test.describe('Trip API contract', () => {
  for (const scenario of ALL_SCENARIOS) {
    test.fixme(`${scenario.specId}: ${scenario.name} matches the web contract`, async ({
      request,
    }) => {
      const response = await request.post(`${apiUrl}/trips/`, { data: scenario.input });
      const expectedStatus = scenario.expected.status ?? 201;
      const body = (await response.json()) as TripResponseBody;

      expect(response.status()).toBe(expectedStatus);

      if (scenario.expected.errorCode) {
        expect(body.error?.code).toBe(scenario.expected.errorCode);
        return;
      }

      expect(body.daily_logs).toHaveLength(scenario.expected.logDays ?? 0);

      if (scenario.expected.totals) {
        expect(body.daily_logs?.map(({ totals }) => totals)).toEqual(scenario.expected.totals);
      }

      if (scenario.expected.stopTypes) {
        expect(body.stops?.map(({ type }) => type)).toEqual(scenario.expected.stopTypes);
      }

      if (scenario.expected.firstStop) {
        expect(body.stops?.[0]?.type).toBe(scenario.expected.firstStop);
      }

      if (scenario.expected.pickupArriveAt) {
        expect(body.stops?.[0]).toMatchObject({
          type: 'pickup',
          arrive_at: scenario.expected.pickupArriveAt,
        });
      }
    });
  }
});
