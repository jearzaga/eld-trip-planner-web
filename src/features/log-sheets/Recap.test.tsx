import { screen } from '@testing-library/react';

import { Recap } from '@/features/log-sheets/Recap';
import { tripPlanSchema } from '@/features/trip-results/schema';
import { previewTrip } from '@/test/previewTrip';
import { renderWithProviders } from '@/test/render';

describe('Recap', () => {
  it('renders every API-provided 70-hour recap value', () => {
    const recap = tripPlanSchema.parse(previewTrip).daily_logs[0].recap;
    renderWithProviders(<Recap recap={recap} />);

    expect(screen.getByText('70 Hour / 8 Day')).toBeInTheDocument();
    expect(screen.getByTestId('recap-on-duty-today')).toHaveTextContent('12.25');
    expect(screen.getByTestId('recap-a')).toHaveTextContent('32.25');
    expect(screen.getByTestId('recap-b')).toHaveTextContent('37.75');
    expect(screen.getByTestId('recap-c')).toHaveTextContent('32.25');
  });

  it('shows the API restart note when a restart was taken', () => {
    const recap = {
      ...tripPlanSchema.parse(previewTrip).daily_logs[0].recap,
      restart_34_taken: true,
    };
    renderWithProviders(<Recap recap={recap} />);

    expect(screen.getByTestId('recap-restart-note')).toHaveTextContent('34-hour restart taken');
  });
});
