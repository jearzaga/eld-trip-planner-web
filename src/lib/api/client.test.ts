import { http, HttpResponse } from 'msw';

import { api } from '@/lib/api/client';
import { server } from '@/test/server';

describe('API client', () => {
  it('uses the configured API URL and cold-start timeout', () => {
    expect(api.defaults.baseURL).toBe('http://localhost:8000/api');
    expect(api.defaults.timeout).toBe(90_000);
  });

  it('normalizes API error responses', async () => {
    server.use(
      http.get('http://localhost:8000/api/trips/failing/', () =>
        HttpResponse.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Check the highlighted fields.',
              fields: { cycle_used_hrs: ['Must be at most 70.'] },
            },
          },
          { status: 422 },
        ),
      ),
    );

    await expect(api.get('/trips/failing/')).rejects.toEqual({
      status: 422,
      code: 'VALIDATION_ERROR',
      message: 'Check the highlighted fields.',
      fields: { cycle_used_hrs: ['Must be at most 70.'] },
    });
  });

  it('normalizes network failures', async () => {
    server.use(http.get('http://localhost:8000/api/health/', () => HttpResponse.error()));

    await expect(api.get('/health/')).rejects.toEqual({
      status: null,
      code: 'NETWORK_ERROR',
      message: 'Something went wrong. Please try again.',
      fields: undefined,
    });
  });
});
