import { screen, within } from '@testing-library/react';

import { LogSheet } from '@/features/log-sheets/LogSheet';
import { tripPlanSchema } from '@/features/trip-results/schema';
import twoDayTrip from '@/test/fixtures/sc2.json';
import { renderWithProviders } from '@/test/render';

describe('LogSheet', () => {
  const firstDayLog = tripPlanSchema.parse(twoDayTrip).daily_logs[0];

  // AC-21 · AC-34
  it('draws a whole daily log from the API values for that day', () => {
    renderWithProviders(<LogSheet log={firstDayLog} visible />);

    const sheet = screen.getByTestId('log-sheet');
    expect(sheet).toHaveAttribute('data-day', '1');
    expect(within(sheet).getByTestId('log-date')).toHaveTextContent('09 / 24 / 2026');
    expect(within(sheet).getByTestId('log-from')).toHaveTextContent('Richmond, VA');
    expect(within(sheet).getByTestId('log-carrier')).toHaveTextContent("John Doe's Transportation");
    expect(within(sheet).getByTestId('total-OFF')).toHaveTextContent('6.5');
    expect(within(sheet).getByTestId('total-SB')).toHaveTextContent('5.25');
    expect(within(sheet).getByTestId('total-D')).toHaveTextContent('11');
    expect(within(sheet).getByTestId('total-ON')).toHaveTextContent('1.25');
    expect(within(sheet).getByTestId('duty-line')).toBeInTheDocument();
    expect(within(sheet).getAllByTestId('remark-item')).toHaveLength(firstDayLog.remarks.length);
    expect(within(sheet).getByTestId('log-shipping-doc')).toHaveTextContent('BOL-10001');
    expect(within(sheet).getByTestId('recap-on-duty-today')).toHaveTextContent('12.25');
    expect(within(sheet).getByTestId('recap-b')).toHaveTextContent('37.75');
  });
});
