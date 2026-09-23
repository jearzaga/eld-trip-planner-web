import { screen } from '@testing-library/react';

import { RouteInstructions } from '@/features/route-map/RouteInstructions';
import { tripPlanSchema } from '@/features/trip-results/schema';
import twoDayTrip from '@/test/fixtures/sc2.json';
import { renderWithProviders } from '@/test/render';

describe('RouteInstructions', () => {
  it('lists each route leg in order with its places, distance, and driving time', () => {
    renderWithProviders(<RouteInstructions trip={tripPlanSchema.parse(twoDayTrip)} />);

    const legs = screen.getAllByTestId('route-leg');
    expect(screen.getByTestId('route-legs')).toBeInTheDocument();
    expect(legs).toHaveLength(2);
    expect(legs[0]).toHaveTextContent('Richmond, VA → Baltimore, MD');
    expect(legs[0]).toHaveTextContent('120 mi · 2 h');
    expect(legs[1]).toHaveTextContent('Baltimore, MD → Kansas City, MO');
    expect(legs[1]).toHaveTextContent('1,080 mi · 18 h');
  });
});
