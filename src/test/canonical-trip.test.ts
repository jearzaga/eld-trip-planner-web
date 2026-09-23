import twoDay from '../../e2e/fixtures/responses/sc2.json';
import cycleFull from '../../e2e/fixtures/responses/sc4.json';
import { tripForScenarioInput } from '../../e2e/fixtures/mock-trip-api';
import {
  CYCLE_FULL_TRIP,
  ROUTABLE_SCENARIOS,
  TWO_DAY_WORKED_EXAMPLE_TRIP,
} from '../../e2e/fixtures/scenarios';

describe('browser scenario responses', () => {
  it('uses the published two-day response for the sample trip', () => {
    expect(tripForScenarioInput(TWO_DAY_WORKED_EXAMPLE_TRIP.input)).toEqual(twoDay);
  });

  it('uses the published starting-cycle restart response', () => {
    expect(tripForScenarioInput(CYCLE_FULL_TRIP.input)).toEqual(cycleFull);
  });

  it('has a published response for every routable browser scenario', () => {
    for (const scenario of ROUTABLE_SCENARIOS) {
      const response = tripForScenarioInput(scenario.input);
      expect(response?.summary.log_days).toBe(scenario.expected.logDays);
    }
  });

  it('does not manufacture a trip for an unknown route', () => {
    expect(
      tripForScenarioInput({
        ...TWO_DAY_WORKED_EXAMPLE_TRIP.input,
        dropoff: { label: 'Unknown, ZZ', lat: 0, lng: 0 },
      }),
    ).toBeUndefined();
  });
});
