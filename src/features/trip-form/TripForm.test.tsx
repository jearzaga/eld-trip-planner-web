import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TripForm } from '@/features/trip-form/TripForm';
import { renderWithProviders } from '@/test/render';

describe('TripForm', () => {
  it('shows defaults and expands prefilled log details', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TripForm onSubmit={vi.fn()} onPlanned={vi.fn()} />);

    expect(screen.getByLabelText(/trip start/i)).not.toHaveValue('');
    expect(screen.getByLabelText(/home-terminal time zone/i)).not.toHaveValue('');
    expect(screen.getByRole('switch', { name: /include inspections/i })).toBeChecked();

    await user.click(screen.getByTestId('log-details'));
    expect(screen.getByLabelText(/driver name/i)).toHaveValue('John Doe');
    expect(screen.getByLabelText(/carrier name/i)).toHaveValue("John Doe's Transportation");
    expect(screen.getByLabelText(/shipping document/i)).toHaveValue('BOL-10001');
  });

  it('fills the known multi-day sample trip', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TripForm onSubmit={vi.fn()} onPlanned={vi.fn()} />);

    await user.type(screen.getByTestId('input-current'), 'Part');
    await user.click(screen.getByTestId('btn-sample-trip'));

    expect(screen.getByTestId('input-current')).toHaveValue('Richmond, VA');
    expect(screen.getByTestId('input-pickup')).toHaveValue('Baltimore, MD');
    expect(screen.getByTestId('input-dropoff')).toHaveValue('Kansas City, MO');
    expect(screen.getByTestId('input-cycle-used')).toHaveValue(20);
  });

  it('blocks invalid cycle values with an inline error', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithProviders(<TripForm onSubmit={onSubmit} onPlanned={vi.fn()} />);

    await user.click(screen.getByTestId('btn-sample-trip'));
    const cycleInput = screen.getByTestId('input-cycle-used');
    await user.clear(cycleInput);
    await user.type(cycleInput, '70.25');
    await user.click(screen.getByTestId('btn-plan-trip'));

    expect(screen.getByText(/between 0 and 70 hours/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows planning progress and reports the created trip id', async () => {
    const user = userEvent.setup();
    let resolvePlan: ((value: { id: string }) => void) | undefined;
    const onSubmit = vi.fn(
      () =>
        new Promise<{ id: string }>((resolve) => {
          resolvePlan = resolve;
        }),
    );
    const onPlanned = vi.fn();
    renderWithProviders(<TripForm onSubmit={onSubmit} onPlanned={onPlanned} />);

    await user.click(screen.getByTestId('btn-sample-trip'));
    await user.click(screen.getByTestId('btn-plan-trip'));

    expect(screen.getByTestId('planning-loader')).toHaveTextContent(/routing your trip/i);
    resolvePlan?.({ id: 'trip-123' });

    expect(await screen.findByText(/trip plan is ready/i)).toBeInTheDocument();
    expect(onPlanned).toHaveBeenCalledWith('trip-123');
  });
});
