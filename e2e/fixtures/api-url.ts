export const apiUrl =
  process.env.E2E_API_URL ?? `http://localhost:${process.env.E2E_API_PORT ?? 8000}/api`;
