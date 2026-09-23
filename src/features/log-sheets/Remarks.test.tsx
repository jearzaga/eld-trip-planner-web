import { screen } from '@testing-library/react';

import { Remarks } from '@/features/log-sheets/Remarks';
import { tripPlanSchema } from '@/features/trip-results/schema';
import canonicalTrip from '@/test/fixtures/sc2.json';
import { previewTrip } from '@/test/previewTrip';
import { renderWithProviders } from '@/test/render';

describe('Remarks', () => {
  it('lists each status change with local time, location, reason, and shipping details', () => {
    const log = tripPlanSchema.parse(previewTrip).daily_logs[0];
    renderWithProviders(<Remarks log={log} />);

    expect(screen.getAllByTestId('remark-item')).toHaveLength(log.remarks.length);
    expect(screen.getAllByTestId('remark-item')[0]).toHaveTextContent('06:00');
    expect(screen.getAllByTestId('remark-item')[0]).toHaveTextContent('Richmond, VA');
    expect(screen.getByTestId('log-shipping-doc')).toHaveTextContent('BOL-10001');
    expect(screen.getByTestId('log-shipping-doc')).toHaveTextContent('paper products');
  });

  it('does not show an empty reason separator for a published nullable remark', () => {
    const log = tripPlanSchema.parse(canonicalTrip).daily_logs[0];
    renderWithProviders(<Remarks log={log} />);

    expect(screen.getAllByTestId('remark-item')[1]).toHaveTextContent('Richmond, VA');
    expect(screen.getAllByTestId('remark-item')[1]).not.toHaveTextContent('—');
  });
});
