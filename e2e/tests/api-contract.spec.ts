import { expect, test } from '@playwright/test';

import shortDay from '../fixtures/responses/sc1.json' with { type: 'json' };
import twoDay from '../fixtures/responses/sc2.json' with { type: 'json' };
import cycleLimited from '../fixtures/responses/sc3.json' with { type: 'json' };
import cycleFull from '../fixtures/responses/sc4.json' with { type: 'json' };
import crossCountry from '../fixtures/responses/sc5.json' with { type: 'json' };
import unroutable from '../fixtures/responses/sc6.json' with { type: 'json' };
import pickupAtCurrent from '../fixtures/responses/sc7.json' with { type: 'json' };
import { apiUrl } from '../fixtures/api-url';
import { ALL_SCENARIOS } from '../fixtures/scenarios';

type TripResponseBody = {
  id?: string;
  error?: { code: string };
  daily_logs?: Array<{ totals: Record<string, number> }>;
  stops?: Array<{ type: string; arrive_at: string }>;
};

const fixtures = {
  'SC-1': shortDay,
  'SC-2': twoDay,
  'SC-3': cycleLimited,
  'SC-4': cycleFull,
  'SC-5': crossCountry,
  'SC-6': unroutable,
  'SC-7': pickupAtCurrent,
};

test.describe('Trip API contract', () => {
  for (const scenario of ALL_SCENARIOS) {
    test(`${scenario.specId}: ${scenario.name} matches the web contract`, async ({ request }) => {
      const response = await request.post(`${apiUrl}/trips/`, { data: scenario.input });
      const expectedStatus = scenario.expected.status ?? 201;
      const body = (await response.json()) as TripResponseBody;
      const fixture = fixtures[scenario.specId as keyof typeof fixtures];

      expect(response.status()).toBe(expectedStatus);

      if (scenario.expected.errorCode) {
        expect(body.error?.code).toBe(scenario.expected.errorCode);
        expect(body).toEqual(fixture);
        return;
      }

      if (!('id' in fixture)) throw new Error(`Missing success fixture for ${scenario.specId}`);
      expect(body.id).toMatch(/^[0-9a-f]{24}$/);
      expect({ ...body, id: fixture.id }).toEqual(fixture);

      expect(body.daily_logs).toHaveLength(scenario.expected.logDays ?? 0);

      if (scenario.expected.totals) {
        const leadingTotals = body.daily_logs
          ?.slice(0, scenario.expected.totals.length)
          .map(({ totals }) => totals);
        expect(leadingTotals).toEqual(scenario.expected.totals);
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
