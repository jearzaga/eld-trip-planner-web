import { screen } from '@testing-library/react';

import { Remarks } from '@/features/log-sheets/Remarks';
import { tripPlanSchema } from '@/features/trip-results/schema';
import twoDayTrip from '@/test/fixtures/sc2.json';
import { renderWithProviders } from '@/test/render';

describe('Remarks', () => {
  const log = tripPlanSchema.parse(twoDayTrip).daily_logs[0];

  it('lists each status change with local time, location, reason, and shipping details', () => {
    renderWithProviders(<Remarks log={log} />);

    expect(screen.getAllByTestId('remark-item')).toHaveLength(log.remarks.length);
    expect(screen.getAllByTestId('remark-item')[0]).toHaveTextContent('06:00');
    expect(screen.getAllByTestId('remark-item')[0]).toHaveTextContent('Richmond, VA');
    expect(screen.getByTestId('log-shipping-doc')).toHaveTextContent('DVL or Manifest No.');
    expect(screen.getByTestId('log-shipping-doc')).toHaveTextContent('BOL-10001');
    expect(screen.getByTestId('log-shipping-doc')).toHaveTextContent('Shipper & Commodity');
    expect(screen.getByTestId('log-shipping-doc')).toHaveTextContent('paper products');
  });

  it('prints the template instruction for recording duty changes', () => {
    renderWithProviders(<Remarks log={log} />);

    expect(
      screen.getByText(
        'Enter name of place you reported and where released from work and when and where each change of duty occurred. Use time standard of home terminal.',
      ),
    ).toBeInTheDocument();
  });

  it('does not show an empty reason separator for a published nullable remark', () => {
    const logWithNullableReason = {
      ...log,
      remarks: log.remarks.map((remark, index) =>
        index === 1 ? { ...remark, note: null } : remark,
      ),
    };
    renderWithProviders(<Remarks log={logWithNullableReason} />);

    expect(screen.getAllByTestId('remark-item')[1]).toHaveTextContent('Richmond, VA');
    expect(screen.getAllByTestId('remark-item')[1]).not.toHaveTextContent('—');
  });
});
