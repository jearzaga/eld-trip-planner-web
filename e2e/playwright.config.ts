import path from 'node:path';

import { defineConfig, devices } from '@playwright/test';

const rootDirectory = process.cwd();
const apiDirectory = path.resolve(rootDirectory, process.env.API_DIR ?? '../eld-trip-planner-api');
const productionWebUrl = process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'http://localhost:5173',
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
          command: 'uv run python manage.py runserver 8000 --noreload',
          cwd: apiDirectory,
          url: 'http://localhost:8000/api/health/',
          env: {
            GEO_PROVIDER: 'fake',
            MONGODB_DB: 'eld_e2e',
            DJANGO_DEBUG: '1',
          },
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
        {
          command: 'npm run dev -- --port 5173 --strictPort',
          cwd: rootDirectory,
          url: 'http://localhost:5173',
          env: { VITE_API_BASE_URL: 'http://localhost:8000/api' },
          reuseExistingServer: !process.env.CI,
        },
      ],
});
