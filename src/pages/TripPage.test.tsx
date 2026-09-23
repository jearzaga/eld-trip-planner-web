import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { TripPage } from '@/pages/TripPage';
import { previewTrip } from '@/test/previewTrip';
import { renderWithProviders } from '@/test/render';
import { server } from '@/test/server';

describe('TripPage', () => {
  it('shows result skeletons, loads the saved trip, and copies its URL', async () => {
    server.use(
      http.get('http://localhost:8000/api/trips/trip-w7-preview/', async () => {
        await delay(50);
        return HttpResponse.json(previewTrip);
      }),
    );
    const router = createMemoryRouter([{ path: '/trips/:id', element: <TripPage /> }], {
      initialEntries: ['/trips/trip-w7-preview'],
    });
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);

    renderWithProviders(<RouterProvider router={router} />);

    expect(screen.getByTestId('trip-loading')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: /richmond.*kansas city/i })).toBeInTheDocument();

    await user.click(screen.getByTestId('btn-copy-link'));
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('/trips/trip-w7-preview'));
  });
});
