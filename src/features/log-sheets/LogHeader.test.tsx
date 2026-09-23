import { screen } from '@testing-library/react';

import { LogHeader } from '@/features/log-sheets/LogHeader';
import { tripPlanSchema } from '@/features/trip-results/schema';
import twoDayTrip from '@/test/fixtures/sc2.json';
import { renderWithProviders } from '@/test/render';

describe('LogHeader', () => {
  it('uses the paper-template wording and API header values', () => {
    const log = tripPlanSchema.parse(twoDayTrip).daily_logs[0];
    renderWithProviders(<LogHeader log={log} />);

    expect(screen.getByText('Drivers Daily Log')).toBeInTheDocument();
    expect(
      screen.getByText('Duplicate - Driver retains in his/her possession for 8 days.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Truck/Tractor and Trailer Numbers or License Plate(s)/State (show each unit)',
      ),
    ).toBeInTheDocument();
    expect(screen.getByTestId('log-date')).toHaveTextContent('09 / 24 / 2026');
    expect(screen.getByTestId('log-from')).toHaveTextContent('Richmond, VA');
    expect(screen.getByTestId('log-to')).toHaveTextContent('near Indianapolis, IN');
    expect(screen.getByTestId('log-miles-driving')).toHaveTextContent('660');
    expect(screen.getByTestId('log-total-mileage')).toHaveTextContent('660');
    expect(screen.getByTestId('log-vehicle-numbers')).toHaveTextContent('123 / 456');
    expect(screen.getByTestId('log-carrier')).toHaveTextContent("John Doe's Transportation");
  });
});
