import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { StopsTimeline } from '@/features/stops/StopsTimeline';
import { tripPlanSchema } from '@/features/trip-results/schema';
import { useUiStore } from '@/stores/ui-store';
import { previewTrip } from '@/test/previewTrip';
import { renderWithProviders } from '@/test/render';

describe('StopsTimeline', () => {
  beforeEach(() => useUiStore.setState({ selectedStopSeq: null }));

  it('renders ordered stop details and selects a stop', async () => {
    const user = userEvent.setup();
    const trip = tripPlanSchema.parse(previewTrip);
    renderWithProviders(
      <StopsTimeline stops={trip.stops} timeZone={trip.summary.home_timezone} />,
    );

    expect(screen.getAllByTestId('stop-item')).toHaveLength(5);
    expect(screen.getByText('Baltimore, MD')).toBeInTheDocument();
    expect(screen.getAllByLabelText('Stop duration')[0]).toHaveTextContent('1 h');

    await user.click(screen.getAllByTestId('stop-item')[1]);
    expect(useUiStore.getState().selectedStopSeq).toBe(2);
  });
});
