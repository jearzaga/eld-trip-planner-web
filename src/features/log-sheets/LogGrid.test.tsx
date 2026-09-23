import { screen } from '@testing-library/react';

import { LogGrid } from '@/features/log-sheets/LogGrid';
import { tripPlanSchema } from '@/features/trip-results/schema';
import twoDayTrip from '@/test/fixtures/sc2.json';
import { renderWithProviders } from '@/test/render';

describe('LogGrid', () => {
  const log = tripPlanSchema.parse(twoDayTrip).daily_logs[0];

  it('draws four duty rows, quarter-hour ticks, and API totals', () => {
    renderWithProviders(<LogGrid log={log} />);

    expect(screen.getByTestId('log-grid')).toHaveTextContent('Mid-night');
    expect(screen.getByTestId('log-grid')).toHaveTextContent('Noon');
    expect(screen.getByTestId('log-grid')).toHaveTextContent('1. Off Duty');
    expect(screen.getByTestId('log-grid')).toHaveTextContent('2. Sleeper Berth');
    expect(screen.getByTestId('log-grid')).toHaveTextContent('3. Driving');
    expect(screen.getByTestId('log-grid')).toHaveTextContent('4. On Duty (not driving)');
    expect(screen.getAllByTestId('quarter-hour-tick')).toHaveLength(97);
    expect(screen.getByTestId('total-OFF')).toHaveTextContent('6.5');
    expect(screen.getByTestId('total-sum')).toHaveTextContent('24');
  });

  it('labels the totals column in ink like the paper template', () => {
    const { container } = renderWithProviders(<LogGrid log={log} />);

    const heading = container.querySelector('[data-total-hours-heading]');
    expect(heading).toHaveTextContent('Total Hours');
    expect(heading).toHaveAttribute('fill', 'currentColor');
  });

  it('rules a short line above the day total', () => {
    const { container } = renderWithProviders(<LogGrid log={log} />);

    expect(container.querySelector('[data-total-sum-rule]')).toBeInTheDocument();
  });

  it('draws one continuous path directly from the supplied segments', () => {
    renderWithProviders(<LogGrid log={log} />);

    expect(screen.getByTestId('duty-line')).toHaveAttribute('d', expect.stringMatching(/^M.+H.+V/));
  });

  it('brackets each stop from its remark to the next status change', () => {
    const { container } = renderWithProviders(<LogGrid log={log} />);

    const pickupMarker = container.querySelector('[data-remark-marker][data-at-min="495"]');
    expect(pickupMarker).toHaveAttribute('data-until-min', '555');
    expect(pickupMarker).toHaveAttribute(
      'd',
      expect.stringMatching(/^M 391\.25 \S+ V \S+ H 422\.9\d* V/),
    );
    const departureMarker = container.querySelector('[data-remark-marker][data-at-min="555"]');
    expect(departureMarker).not.toHaveAttribute('data-until-min');
  });

  it('writes each stop location once, in legible angled labels', () => {
    const { container } = renderWithProviders(<LogGrid log={log} />);

    const labels = [...container.querySelectorAll('[data-remark-label]')];
    expect(labels.map((label) => label.textContent)).toEqual([
      'Richmond, VA',
      'Baltimore, MD',
      'near Dayton, OH',
      'near Indianapolis, IN',
    ]);
    for (const label of labels) {
      expect(Number(label.getAttribute('font-size'))).toBeGreaterThanOrEqual(10);
      expect(label.getAttribute('transform')).toMatch(/^rotate\(/);
    }
  });

  it('staggers labels whose changes are too close to share a line', () => {
    const crowdedLog = {
      ...log,
      remarks: [
        { at_min: 600, location: 'Hagerstown, MD', note: 'Fuel' },
        { at_min: 615, location: 'Clear Spring, MD', note: null },
      ],
    };
    const { container } = renderWithProviders(<LogGrid log={crowdedLog} />);

    const [earlier, later] = [...container.querySelectorAll('[data-remark-label]')];
    expect(Number(earlier.getAttribute('y'))).toBeGreaterThan(Number(later.getAttribute('y')));
  });
});
