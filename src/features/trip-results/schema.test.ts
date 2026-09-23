import type { z } from 'zod';

import type { components } from '@/lib/api/schema';
import canonicalTrip from '@/test/fixtures/sc2.json';

import { tripPlanSchema } from './schema';

describe('trip response schema', () => {
  it('accepts the published API response, including nullable segment details', () => {
    expect(tripPlanSchema.parse(canonicalTrip)).toMatchObject({
      id: canonicalTrip.id,
      summary: canonicalTrip.summary,
    });
  });

  it('validates exactly the generated trip response contract', () => {
    expectTypeOf<z.infer<typeof tripPlanSchema>>().toEqualTypeOf<
      components['schemas']['TripResponse']
    >();
  });
});
