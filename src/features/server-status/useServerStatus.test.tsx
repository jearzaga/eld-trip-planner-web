import { act, renderHook } from '@testing-library/react';
import { delay, http, HttpResponse } from 'msw';

import { useServerStatus } from '@/features/server-status/useServerStatus';
import { server } from '@/test/server';
import { TestProviders } from '@/test/providers';

describe('useServerStatus', () => {
  afterEach(() => vi.useRealTimers());

  it('shows the wake state after three seconds while health is pending', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    server.use(
      http.get('http://localhost:8000/api/health/', async () => {
        await delay(5_000);
        return HttpResponse.json({ status: 'ok' });
      }),
    );

    const { result } = renderHook(() => useServerStatus(), {
      wrapper: TestProviders,
    });

    expect(result.current.showWakeBanner).toBe(false);
    await act(() => vi.advanceTimersByTimeAsync(3_000));
    expect(result.current.showWakeBanner).toBe(true);
  });
});
