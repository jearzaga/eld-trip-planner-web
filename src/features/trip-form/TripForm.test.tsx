import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TripForm } from '@/features/trip-form/TripForm';
import { renderWithProviders } from '@/test/render';

describe('TripForm', () => {
  it('shares selected locations with the live preview when a sample trip is loaded', async () => {
    const user = userEvent.setup();
    const onLocationsChange = vi.fn();
    renderWithProviders(
      <TripForm onSubmit={vi.fn()} onPlanned={vi.fn()} onLocationsChange={onLocationsChange} />,
    );

    await user.click(screen.getByRole('button', { name: 'Try a sample trip' }));

    await waitFor(() =>
      expect(onLocationsChange).toHaveBeenLastCalledWith({
        current: { label: 'Richmond, VA', lat: 37.5407, lng: -77.436 },
        pickup: { label: 'Baltimore, MD', lat: 39.2904, lng: -76.6122 },
        dropoff: { label: 'Kansas City, MO', lat: 39.0997, lng: -94.5786 },
      }),
    );
  });

  it('shows defaults and expands prefilled log details', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TripForm onSubmit={vi.fn()} onPlanned={vi.fn()} />);

    expect(screen.getByTestId('input-start-time')).toHaveTextContent(/\d{4}/);
    expect(screen.getByLabelText(/home-terminal time zone/i)).not.toHaveValue('');
    expect(screen.getByRole('switch', { name: /include inspections/i })).toBeChecked();

    await user.click(screen.getByTestId('log-details'));
    expect(screen.getByLabelText(/driver name/i)).toHaveValue('John Doe');
    expect(screen.getByLabelText(/carrier name/i)).toHaveValue("John Doe's Transportation");
    expect(screen.getByLabelText(/shipping document/i)).toHaveValue('BOL-10001');
  });

  it('uses a calendar to update the trip start date while preserving the time', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TripForm onSubmit={vi.fn()} onPlanned={vi.fn()} />);
    const time = screen.getByLabelText('Start time');
    const initialTime = (time as HTMLInputElement).value;

    expect(screen.getByTestId('input-start-time').tagName).toBe('BUTTON');
    await user.click(screen.getByTestId('input-start-time'));
    expect(screen.getByRole('grid')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^today$/i }));

    expect(time).toHaveValue(initialTime);
    expect(screen.getByTestId('input-start-time')).toHaveTextContent(/\d{4}/);
  });

  it('fills the known multi-day sample trip', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TripForm onSubmit={vi.fn()} onPlanned={vi.fn()} />);

    await user.type(screen.getByTestId('input-current'), 'Part');
    // AC-05
    await user.click(screen.getByRole('button', { name: 'Try a sample trip' }));

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

    await waitFor(() => expect(onPlanned).toHaveBeenCalledWith('trip-123'));
    expect(screen.queryByText(/trip plan is ready/i)).not.toBeInTheDocument();
  });

  it('preserves the trip and offers a retry after planning fails', async () => {
    const user = userEvent.setup();
    const onSubmit = vi
      .fn<() => Promise<{ id: string }>>()
      .mockRejectedValueOnce({ status: 503, code: 'SERVER_UNAVAILABLE', message: 'Unavailable' })
      .mockResolvedValueOnce({ id: 'trip-recovered' });
    const onPlanned = vi.fn();
    renderWithProviders(<TripForm onSubmit={onSubmit} onPlanned={onPlanned} />);

    await user.click(screen.getByTestId('btn-sample-trip'));
    await user.click(screen.getByTestId('btn-plan-trip'));

    expect(await screen.findByTestId('error-banner')).toHaveTextContent(/server.*waking/i);
    expect(screen.getByTestId('input-current')).toHaveValue('Richmond, VA');

    await user.click(screen.getByTestId('error-retry'));

    expect(onSubmit).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(onPlanned).toHaveBeenCalledWith('trip-recovered'));
  });

  it('shows API validation errors on the fields they belong to', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue({
      status: 400,
      code: 'VALIDATION_ERROR',
      message: 'Invalid request.',
      fields: {
        'pickup.lat': ['Ensure this value is less than or equal to 90.'],
        cycle_used_hrs: ['Must be between 0 and 70.'],
        'log_meta.driver_name': ['This field may not be blank.'],
      },
    });
    renderWithProviders(<TripForm onSubmit={onSubmit} onPlanned={vi.fn()} />);

    await user.click(screen.getByTestId('btn-sample-trip'));
    await user.click(screen.getByTestId('btn-plan-trip'));

    expect(await screen.findByText('Must be between 0 and 70.')).toBeInTheDocument();
    expect(screen.getByTestId('input-cycle-used')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Ensure this value is less than or equal to 90.')).toBeInTheDocument();
    expect(screen.getByTestId('input-pickup')).toHaveAttribute('aria-invalid', 'true');
    await user.click(screen.getByTestId('log-details'));
    expect(screen.getByLabelText(/driver name/i)).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('This field may not be blank.')).toBeInTheDocument();
  });
});
