import path from 'node:path';

import { defineConfig, devices } from '@playwright/test';

const rootDirectory = process.cwd();
const apiDirectory = path.resolve(rootDirectory, process.env.API_DIR ?? '../eld-trip-planner-api');
const productionWebUrl = process.env.E2E_BASE_URL;
const localWebPort = Number(process.env.E2E_PORT ?? 5173);
const localWebUrl = `http://localhost:${localWebPort}`;
const localApiPort = Number(process.env.E2E_API_PORT ?? 8000);
const localApiUrl = `http://localhost:${localApiPort}/api`;
const apiPython = process.env.E2E_API_PYTHON ?? 'uv run python';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: localWebUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: productionWebUrl
    ? [
        {
          name: 'smoke',
          use: { ...devices['Desktop Chrome'], baseURL: productionWebUrl },
          grep: /@smoke/,
          timeout: 180_000,
        },
      ]
    : [
        {
          name: 'desktop',
          use: {
            ...devices['Desktop Chrome'],
            viewport: { width: 1440, height: 900 },
          },
          grepInvert: /@smoke/,
        },
        {
          name: 'mobile',
          use: { ...devices['Pixel 7'] },
          grepInvert: /@smoke/,
        },
      ],
  webServer: productionWebUrl
    ? undefined
    : [
        {
          command: `${apiPython} manage.py runserver ${localApiPort} --noreload`,
          cwd: apiDirectory,
          url: `${localApiUrl}/health/`,
          env: {
            GEO_PROVIDER: 'fake',
            MONGODB_DB: 'eld_e2e',
            DJANGO_DEBUG: '1',
          },
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
        {
          command: `npm run dev -- --port ${localWebPort} --strictPort`,
          cwd: rootDirectory,
          url: localWebUrl,
          env: { VITE_API_BASE_URL: localApiUrl },
          reuseExistingServer: !process.env.CI,
        },
      ],
});
