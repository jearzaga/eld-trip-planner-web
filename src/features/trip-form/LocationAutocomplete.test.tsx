import { useState } from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { LocationAutocomplete } from '@/features/trip-form/LocationAutocomplete';
import type { LocationOption } from '@/features/trip-form/schema';
import { renderWithProviders } from '@/test/render';
import { server } from '@/test/server';

function LocationHarness() {
  const [value, setValue] = useState<LocationOption>();
  return (
    <LocationAutocomplete
      field="current"
      label="Current location"
      value={value}
      onChange={setValue}
    />
  );
}

describe('LocationAutocomplete', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('opens selectable suggestions as soon as an empty field receives focus', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LocationHarness />);

    await user.click(screen.getByLabelText('Current location'));
    expect(screen.getByTestId('suggestions-current')).toBeVisible();
    await user.click(screen.getByText('Richmond, VA'));
    expect(screen.getByLabelText('Current location')).toHaveValue('Richmond, VA');
  });

  it('requests the current position only when clicked and keeps the exact coordinates', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const getCurrentPosition = vi.fn((success: PositionCallback) =>
      success({ coords: { latitude: 37.5407, longitude: -77.436 } } as GeolocationPosition),
    );
    vi.stubGlobal('navigator', { ...navigator, geolocation: { getCurrentPosition } });
    renderWithProviders(
      <LocationAutocomplete field="current" label="Current location" onChange={onChange} />,
    );

    expect(getCurrentPosition).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: /use my location/i }));
    expect(getCurrentPosition).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({
      label: 'My location (37.5407, -77.4360)',
      lat: 37.5407,
      lng: -77.436,
    });
  });

  it('explains denied location access and keeps manual search available', async () => {
    const user = userEvent.setup();
    const getCurrentPosition = vi.fn((_success: PositionCallback, error: PositionErrorCallback) =>
      error({ code: 1 } as GeolocationPositionError),
    );
    vi.stubGlobal('navigator', { ...navigator, geolocation: { getCurrentPosition } });
    renderWithProviders(<LocationHarness />);

    await user.click(screen.getByRole('button', { name: /use my location/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/enter a place instead/i);
    await user.type(screen.getByLabelText('Current location'), 'Rich');
    expect(screen.getByLabelText('Current location')).toHaveValue('Rich');
  });

  it('waits 300 ms, shows suggestions, and supports keyboard selection', async () => {
    let requestCount = 0;
    server.use(
      http.get('http://localhost:8000/api/geocode/', ({ request }) => {
        requestCount += 1;
        expect(new URL(request.url).searchParams.get('q')).toBe('Rich');
        return HttpResponse.json([{ label: 'Richmond, VA', lat: 37.5407, lng: -77.436 }]);
      }),
    );
    renderWithProviders(<LocationHarness />);

    const input = screen.getByLabelText('Current location');
    fireEvent.change(input, { target: { value: 'Rich' } });
    expect(requestCount).toBe(0);

    await new Promise((resolve) => window.setTimeout(resolve, 250));
    expect(requestCount).toBe(0);

    await waitFor(() => expect(screen.getByText('Richmond, VA')).toBeInTheDocument());
    const user = userEvent.setup();
    await user.click(input);
    await user.keyboard('{ArrowDown}{Enter}');

    expect(input).toHaveValue('Richmond, VA');
  });
});
