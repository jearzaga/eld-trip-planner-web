import { screen } from '@testing-library/react';
import { delay, http, HttpResponse } from 'msw';

import { WakeBanner } from '@/features/server-status/WakeBanner';
import { renderWithProviders } from '@/test/render';
import { server } from '@/test/server';

const healthUrl = 'http://localhost:8000/api/health/';

describe('WakeBanner', () => {
  // AC-46
  it('tells the driver the free-tier server is waking up while health is pending', async () => {
    server.use(
      http.get(healthUrl, async () => {
        await delay('infinite');
        return HttpResponse.json({ status: 'ok' });
      }),
    );

    renderWithProviders(<WakeBanner />);

    expect(
      await screen.findByText('Waking up the server (≈1 min on the free tier)…'),
    ).toBeInTheDocument();
  });

  it('explains that the server could not be reached when health fails', async () => {
    server.use(http.get(healthUrl, () => HttpResponse.error()));

    renderWithProviders(<WakeBanner />);

    expect(
      await screen.findByText(/could not reach the planning server/i, {}, { timeout: 2_500 }),
    ).toBeInTheDocument();
  });
});
