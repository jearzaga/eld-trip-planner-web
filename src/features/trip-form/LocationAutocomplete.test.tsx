import { useState } from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import {
  LocationAutocomplete,
  type LocationOption,
} from '@/features/trip-form/LocationAutocomplete';
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
