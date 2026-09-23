import { screen } from '@testing-library/react';

import { LogGrid } from '@/features/log-sheets/LogGrid';
import { tripPlanSchema } from '@/features/trip-results/schema';
import { previewTrip } from '@/test/previewTrip';
import { renderWithProviders } from '@/test/render';

describe('LogGrid', () => {
  const log = tripPlanSchema.parse(previewTrip).daily_logs[0];

  it('draws four duty rows, quarter-hour ticks, and API totals', () => {
    renderWithProviders(<LogGrid log={log} />);

    expect(screen.getByTestId('log-grid')).toHaveTextContent('Mid-night');
    expect(screen.getByTestId('log-grid')).toHaveTextContent('Noon');
    expect(screen.getByTestId('log-grid')).toHaveTextContent('Off Duty');
    expect(screen.getByTestId('log-grid')).toHaveTextContent('Sleeper Berth');
    expect(screen.getByTestId('log-grid')).toHaveTextContent('Driving');
    expect(screen.getByTestId('log-grid')).toHaveTextContent('On Duty');
    expect(screen.getAllByTestId('quarter-hour-tick')).toHaveLength(97);
    expect(screen.getByTestId('total-OFF')).toHaveTextContent('6.5');
    expect(screen.getByTestId('total-sum')).toHaveTextContent('24');
  });

  it('draws one continuous path directly from the supplied segments', () => {
    renderWithProviders(<LogGrid log={log} />);

    expect(screen.getByTestId('duty-line')).toHaveAttribute('d', expect.stringMatching(/^M.+H.+V/));
  });
});
