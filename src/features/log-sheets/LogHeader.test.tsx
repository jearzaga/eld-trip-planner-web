import { screen } from '@testing-library/react';

import { LogHeader } from '@/features/log-sheets/LogHeader';
import { tripPlanSchema } from '@/features/trip-results/schema';
import { previewTrip } from '@/test/previewTrip';
import { renderWithProviders } from '@/test/render';

describe('LogHeader', () => {
  it('uses the paper-template wording and API header values', () => {
    const log = tripPlanSchema.parse(previewTrip).daily_logs[0];
    renderWithProviders(<LogHeader log={log} />);

    expect(screen.getByText('Drivers Daily Log')).toBeInTheDocument();
    expect(screen.getByTestId('log-date')).toHaveTextContent('09 / 24 / 2026');
    expect(screen.getByTestId('log-from')).toHaveTextContent('Richmond, VA');
    expect(screen.getByTestId('log-to')).toHaveTextContent('near Dayton, OH');
    expect(screen.getByTestId('log-miles-driving')).toHaveTextContent('660');
    expect(screen.getByTestId('log-total-mileage')).toHaveTextContent('660');
    expect(screen.getByTestId('log-vehicle-numbers')).toHaveTextContent('123 / 456');
    expect(screen.getByTestId('log-carrier')).toHaveTextContent("John Doe's Transportation");
  });
});
