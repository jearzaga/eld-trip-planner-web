import type { components } from '@/lib/api/schema';

import type { TripFormValues } from './schema';

type TripRequest = components['schemas']['TripRequest'];

describe('trip request contract', () => {
  it('submits the fields of the generated trip request', () => {
    expectTypeOf<TripFormValues>().toExtend<TripRequest>();
    expectTypeOf<keyof TripFormValues>().toEqualTypeOf<keyof TripRequest>();
    expectTypeOf<keyof TripFormValues['log_meta']>().toEqualTypeOf<
      keyof components['schemas']['LogMeta']
    >();
  });
});
