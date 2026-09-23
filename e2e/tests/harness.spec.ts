import { expect, test } from '@playwright/test';

const apiUrl = process.env.E2E_API_URL ?? 'http://localhost:8000/api';

test('application shell and API health endpoint are available', async ({ page, request }) => {
  const healthResponse = await request.get(`${apiUrl}/health/`);

  expect(healthResponse.ok()).toBe(true);
  await expect(healthResponse.json()).resolves.toEqual({ status: 'ok' });

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'ELD Trip Planner' })).toBeVisible();
});
