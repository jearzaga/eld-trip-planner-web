import { screen } from '@testing-library/react';

import { SummaryCards } from '@/features/summary/SummaryCards';
import { tripPlanSchema } from '@/features/trip-results/schema';
import twoDayTrip from '@/test/fixtures/sc2.json';
import { renderWithProviders } from '@/test/render';

describe('SummaryCards', () => {
  it('renders the route totals supplied by the trip response', () => {
    renderWithProviders(<SummaryCards trip={tripPlanSchema.parse(twoDayTrip)} />);

    expect(screen.getByTestId('summary-total-miles')).toHaveTextContent('1,200 mi');
    expect(screen.getByTestId('summary-driving-hrs')).toHaveTextContent('20 h');
    expect(screen.getByTestId('summary-duration')).toHaveTextContent('33 h 30 min');
    expect(screen.getByTestId('summary-arrival')).toHaveTextContent('Sep 25');
    expect(screen.getByTestId('summary-log-days')).toHaveTextContent('2');
    expect(screen.getByTestId('summary-stop-count')).toHaveTextContent('5');
  });
});
