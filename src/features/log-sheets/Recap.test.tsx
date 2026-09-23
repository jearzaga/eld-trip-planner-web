import { screen, within } from '@testing-library/react';

import { Recap } from '@/features/log-sheets/Recap';
import { tripPlanSchema } from '@/features/trip-results/schema';
import twoDayTrip from '@/test/fixtures/sc2.json';
import { renderWithProviders } from '@/test/render';

describe('Recap', () => {
  const recap = tripPlanSchema.parse(twoDayTrip).daily_logs[0].recap;

  it('renders every API-provided 70-hour recap value under the template wording', () => {
    renderWithProviders(<Recap recap={recap} />);

    expect(screen.getByText('Recap: Complete at end of day')).toBeInTheDocument();
    const seventyHourColumn = screen.getByRole('group', { name: '70 Hour/8 Day Drivers' });
    expect(within(seventyHourColumn).getByText('70 Hour/8 Day Drivers')).toBeInTheDocument();
    expect(
      within(seventyHourColumn).getByText('On duty hours today, Total lines 3 & 4'),
    ).toBeInTheDocument();
    expect(
      within(seventyHourColumn).getByText('A. Total hours on duty last 7 days including today.'),
    ).toBeInTheDocument();
    expect(
      within(seventyHourColumn).getByText('B. Total hours available tomorrow 70 hr. minus A*'),
    ).toBeInTheDocument();
    expect(
      within(seventyHourColumn).getByText('C. Total hours on duty last 5 days including today.'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('recap-on-duty-today')).toHaveTextContent('12.25');
    expect(screen.getByTestId('recap-a')).toHaveTextContent('32.25');
    expect(screen.getByTestId('recap-b')).toHaveTextContent('37.75');
    expect(screen.getByTestId('recap-c')).toHaveTextContent('32.25');
    expect(
      screen.getByText('*If you took 34 consecutive hours off duty you have 60/70 hours available'),
    ).toBeInTheDocument();
  });

  it('leaves the 60-hour/7-day column blank for a 70-hour/8-day driver', () => {
    renderWithProviders(<Recap recap={recap} />);

    const sixtyHourColumn = screen.getByRole('group', { name: '60 Hour/7 Day Drivers' });
    expect(within(sixtyHourColumn).getByText(/^A\./)).toBeInTheDocument();
    expect(within(sixtyHourColumn).getByText(/^B\./)).toBeInTheDocument();
    expect(within(sixtyHourColumn).getByText(/^C\./)).toBeInTheDocument();
    expect(sixtyHourColumn).not.toHaveTextContent(/\d+\.\d+/);
    expect(within(sixtyHourColumn).queryByTestId(/^recap-/)).not.toBeInTheDocument();
  });

  it('shows the API restart note when a restart was taken', () => {
    renderWithProviders(<Recap recap={{ ...recap, restart_34_taken: true }} />);

    expect(screen.getByTestId('recap-restart-note')).toHaveTextContent('34-hour restart taken');
  });
});
