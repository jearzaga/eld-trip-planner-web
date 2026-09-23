import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LogSheetPager } from '@/features/log-sheets/LogSheetPager';
import { tripPlanSchema } from '@/features/trip-results/schema';
import { useUiStore } from '@/stores/ui-store';
import twoDayTrip from '@/test/fixtures/sc2.json';
import { renderWithProviders } from '@/test/render';

describe('LogSheetPager', () => {
  beforeEach(() => useUiStore.setState({ activeLogDay: 1 }));

  it('keeps every sheet mounted and pages between days or all sheets', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LogSheetPager trip={tripPlanSchema.parse(twoDayTrip)} />);

    const sheets = screen.getAllByTestId('log-sheet');
    expect(sheets).toHaveLength(2);
    expect(sheets[0]).toBeVisible();
    expect(sheets[1]).not.toBeVisible();

    await user.click(screen.getByTestId('btn-next-log'));
    expect(sheets[1]).toBeVisible();
    expect(useUiStore.getState().activeLogDay).toBe(2);

    await user.click(screen.getByRole('tab', { name: 'All sheets' }));
    expect(sheets[0]).toBeVisible();
    expect(sheets[1]).toBeVisible();
  });
});
