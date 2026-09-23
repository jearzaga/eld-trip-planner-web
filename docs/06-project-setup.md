# 06 — Project Setup (React + TypeScript via Vite · Tailwind · shadcn/ui · libraries)

Step-by-step setup of `eld-trip-planner-web`, from an empty repo to a green first test with every library wired up.
Run commands from the repo root. `npx` works with npm; the pnpm equivalents are `pnpm dlx` / `pnpm add`.

**Target versions:** Node **22 LTS or 24 LTS**, npm 10+, Vite (latest), React 19, TypeScript 5.x, Tailwind CSS v4.

---

## 1. Library map: what we use and why

| Concern | Library | Why |
|---|---|---|
| Build / dev server | **Vite** (`react-ts` template) | Fast HMR, simple config, deploys to Vercel as static files |
| Styling | **Tailwind CSS v4** (`@tailwindcss/vite`) | Utility CSS; required by shadcn/ui |
| UI components | **shadcn/ui** (+ `lucide-react` icons, installed by init) | Accessible, good-looking components copied into our code so we can restyle freely |
| Routing | **react-router** (v7) | `/` planner, `/trips/:id` shareable results |
| **Server state** (API data, caching, loading/error) | **@tanstack/react-query** (+ devtools) | Handles caching, retries, loading and error states; no hand-written fetch state |
| **Client UI state** (selected stop, active log day, map focus) | **zustand** | Tiny global store for state shared by the map, timeline and log pager |
| **API calls** | **axios** (one instance in `src/lib/api/client.ts`) | Base URL, 90 s timeout (Render cold start), interceptors that normalize errors |
| API types | **openapi-typescript** (dev) | Generates TS types from the API repo's `openapi.yaml`, so types are never hand-written |
| Forms + validation | **react-hook-form** + **zod** + **@hookform/resolvers** | Performant forms; one schema for types and validation; works with shadcn `field` |
| Map | **leaflet** + **react-leaflet** (+ `@types/leaflet`) | Free map with OpenStreetMap tiles; no API key |
| Dates / time zones | **date-fns** + **@date-fns/tz** | Format API times in the home-terminal time zone |
| Unit / component tests | **vitest**, **@vitest/coverage-v8**, **jsdom**, **@testing-library/react**, **@testing-library/user-event**, **@testing-library/jest-dom**, **msw** | TDD inner loop; MSW serves the API fixtures |
| E2E | **@playwright/test**, **@axe-core/playwright** | Required outer loop; a11y checks |
| Formatting | **prettier** + **prettier-plugin-tailwindcss** (optional) | Consistent code; sorted Tailwind classes |

**State rule of thumb:** data from the API lives in TanStack Query. UI-only state shared across components goes in
Zustand. Shareable state goes in the URL (`/trips/:id`). Form state lives in react-hook-form. Everything else is local
`useState`.

---

## 2. Create the Vite + React + TypeScript app

```bash
node -v    # v22.x or v24.x
cd eld-trip-planner-web          # the cloned (non-empty) repo
npm create vite@latest . -- --template react-ts
#  → "Current directory is not empty": choose "Ignore files and continue"
git checkout -- README.md CLAUDE.md 2>/dev/null || true   # restore our files if the template overwrote them
npm install
npm run dev                      # http://localhost:5173 shows the Vite starter
```

Delete the starter content: `src/App.css`, `src/assets/react.svg`, `public/vite.svg`, and clear `src/App.tsx`.

---

## 3. Tailwind CSS v4

```bash
npm install tailwindcss @tailwindcss/vite
```

Replace **all** of `src/index.css` with:

```css
@import "tailwindcss";
```

(The Vite plugin is added in §4 together with the path alias.)

---

## 4. Path alias `@/` (required by shadcn/ui)

```bash
npm install -D @types/node
```

**`tsconfig.json`**: add `compilerOptions` next to the existing `files`/`references`:

```json
{
  "files": [],
  "references": [{ "path": "./tsconfig.app.json" }, { "path": "./tsconfig.node.json" }],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

**`tsconfig.app.json`**: add the same two keys inside the existing `compilerOptions`, plus the test globals types:

```jsonc
{
  "compilerOptions": {
    // …keep the generated options…
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] },
    "types": ["vite/client", "vitest/globals", "@testing-library/jest-dom"]
  }
}
```

> If your TypeScript version reports `baseUrl` as deprecated, remove `baseUrl`. `paths` works without it.

**`vite.config.ts`** (full file; the Vitest section is used from §8 on):

```ts
/// <reference types="vitest/config" />
import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: { port: 5173, strictPort: true },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    include: ['src/**/*.test.{ts,tsx}'],       // keeps Playwright specs in e2e/ out of Vitest
    coverage: { provider: 'v8', reporter: ['text', 'html'] },
  },
});
```

---

## 5. shadcn/ui

### 5.1 Initialize

```bash
npx shadcn@latest init
```

Answer the prompts: pick a **base color** (we suggest *Neutral* or *Slate*) and keep **CSS variables** on.
`init` does the following:

- creates `components.json` (shadcn config, aliases `@/components`, `@/lib/utils`)
- creates `src/lib/utils.ts` (the `cn()` class-merging helper)
- adds theme tokens (CSS variables for colors, radius, dark mode) to `src/index.css`
- installs its runtime deps (e.g. `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`, animation utilities)

### 5.2 Add the components this app needs

```bash
npx shadcn@latest add button input label card badge separator tabs tooltip \
  popover command combobox slider switch collapsible skeleton alert toast field scroll-area sheet
```

| Component | Used for |
|---|---|
| `card`, `badge`, `separator` | Summary cards, stop-type badges, section dividers |
| `field`, `input`, `label` | Trip form fields with react-hook-form (shadcn's Field works with RHF + zod) |
| `combobox` (or `popover` + `command`) | Location autocomplete. For async server search, `popover` + `command` gives full control |
| `slider`, `switch`, `collapsible` | Cycle-used slider, inspections toggle, "Log details" section |
| `tabs` | Log sheet day tabs |
| `skeleton`, `alert`, `toast` | Loading states, error banner, copy-link / retry toasts |
| `tooltip`, `scroll-area`, `sheet` | Rule explanations, long timelines, mobile form drawer |

Components are written to `src/components/ui/*.tsx` and imported like this:

```tsx
import { Button } from '@/components/ui/button';
```

> Components are **your code**. Restyle them freely, and commit them.
> Check the exact component names at ui.shadcn.com/docs/components if the CLI reports one as unknown.

---

## 6. Application libraries

```bash
# routing, server state, client state, HTTP
npm install react-router @tanstack/react-query @tanstack/react-query-devtools zustand axios

# forms + validation
npm install react-hook-form zod @hookform/resolvers

# map
npm install leaflet react-leaflet
npm install -D @types/leaflet

# dates / time zones
npm install date-fns @date-fns/tz

# API type generation (from the API repo's openapi.yaml)
npm install -D openapi-typescript
```

## 7. Testing libraries

```bash
# unit / component
npm install -D vitest @vitest/coverage-v8 jsdom @testing-library/react @testing-library/user-event \
  @testing-library/jest-dom msw

# E2E (configured in W1, see 04-testing-strategy.md §6)
npm install -D @playwright/test @axe-core/playwright
npx playwright install --with-deps chromium

# optional formatting
npm install -D prettier prettier-plugin-tailwindcss eslint-config-prettier
```

---

## 8. Configuration files

### 8.1 `package.json` scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "typecheck": "tsc -b --noEmit",
    "test": "vitest",
    "test:run": "vitest run",
    "coverage": "vitest run --coverage",
    "e2e": "playwright test -c e2e/playwright.config.ts",
    "e2e:ui": "playwright test -c e2e/playwright.config.ts --ui",
    "sync-contract": "node scripts/sync-contract.mjs",
    "gen:api-types": "openapi-typescript src/lib/api/openapi.yaml -o src/lib/api/schema.d.ts",
    "format": "prettier --write ."
  }
}
```

### 8.2 Environment variables

```dotenv
# .env.example  (commit)          → copy to .env.local (don't commit)
VITE_API_BASE_URL=http://localhost:8000/api
```

```ts
// src/vite-env.d.ts   (append)
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

Only variables prefixed `VITE_` reach the browser. **Never put secrets in them.** On Vercel, set
`VITE_API_BASE_URL=https://<api>.onrender.com/api` for Production and Preview.

### 8.3 `vercel.json` (SPA routing for `/trips/:id`)

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

### 8.4 `.gitignore` additions

```gitignore
.env.local
coverage/
playwright-report/
test-results/
e2e/.auth/
```

### 8.5 Prettier (optional) `.prettierrc`

```json
{ "singleQuote": true, "semi": true, "printWidth": 100, "plugins": ["prettier-plugin-tailwindcss"] }
```

---

## 9. Folder structure

```bash
mkdir -p src/{app,pages,stores,lib/api,test/fixtures} \
         src/features/{server-status,trip-form,summary,route-map,stops,log-sheets} \
         e2e/{tests,pages,fixtures/responses} scripts
```

```
src/
├─ app/            providers.tsx · router.tsx
├─ pages/          PlannerPage.tsx · TripPage.tsx · NotFoundPage.tsx
├─ features/       server-status/ · trip-form/ · summary/ · route-map/ · stops/ · log-sheets/
├─ stores/         ui-store.ts (zustand)
├─ components/ui/  shadcn components
├─ lib/            utils.ts (shadcn) · api/{client.ts, hooks.ts, schema.d.ts, openapi.yaml}
├─ test/           setup.ts · server.ts · handlers.ts · fixtures/
├─ main.tsx · App.tsx · index.css
```

---

## 10. Starter wiring (minimum code, each piece covered by a test as you build it)

### 10.1 API client: `src/lib/api/client.ts`

```ts
import axios, { AxiosError } from 'axios';

export type ApiError = {
  status: number | null;              // null = network error / timeout
  code: string;                       // VALIDATION_ERROR | ROUTE_NOT_FOUND | PROVIDER_UNAVAILABLE | NETWORK_ERROR …
  message: string;
  fields?: Record<string, string[]>;
};

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 90_000,                    // Render free tier can take ~1 min to wake (AC-46)
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError<{ error?: Omit<ApiError, 'status'> }>) => {
    const body = err.response?.data?.error;
    const normalized: ApiError = {
      status: err.response?.status ?? null,
      code: body?.code ?? (err.response ? 'UNKNOWN_ERROR' : 'NETWORK_ERROR'),
      message: body?.message ?? 'Something went wrong. Please try again.',
      fields: body?.fields,
    };
    return Promise.reject(normalized);
  },
);
```

### 10.2 Typed hooks: `src/lib/api/hooks.ts`

```ts
import { useMutation, useQuery } from '@tanstack/react-query';
import { api, type ApiError } from './client';
import type { components } from './schema';   // generated by `npm run sync-contract`

export type TripRequest = components['schemas']['TripRequest'];
export type TripResponse = components['schemas']['TripResponse'];

export const useHealth = () =>
  useQuery({
    queryKey: ['health'],
    queryFn: async () => (await api.get<{ status: string }>('/health/')).data,
    retry: 2,
    staleTime: 5 * 60_000,
  });

export const usePlanTrip = () =>
  useMutation<TripResponse, ApiError, TripRequest>({
    mutationFn: async (body) => (await api.post<TripResponse>('/trips/', body)).data,
    retry: (count, err) => count < 1 && [null, 502, 503].includes(err.status), // one retry on cold start
  });

export const useTrip = (id: string) =>
  useQuery({
    queryKey: ['trip', id],
    queryFn: async () => (await api.get<TripResponse>(`/trips/${id}/`)).data,
    staleTime: Infinity,                   // a saved plan never changes
  });
```

> The schema names (`TripRequest`, `TripResponse`) come from drf-spectacular. Check `schema.d.ts` after the first sync
> and adjust the names if needed.

### 10.3 UI store: `src/stores/ui-store.ts` (Zustand)

```ts
import { create } from 'zustand';

type UiState = {
  selectedStopSeq: number | null;
  activeLogDay: number;
  selectStop: (seq: number | null) => void;
  setActiveLogDay: (day: number) => void;
};

export const useUiStore = create<UiState>((set) => ({
  selectedStopSeq: null,
  activeLogDay: 1,
  selectStop: (seq) => set({ selectedStopSeq: seq }),
  setActiveLogDay: (day) => set({ activeLogDay: day }),
}));
```

### 10.4 Providers + router

```tsx
// src/app/providers.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
```

```tsx
// src/app/router.tsx
import { createBrowserRouter } from 'react-router';
import { PlannerPage } from '@/pages/PlannerPage';
import { TripPage } from '@/pages/TripPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const router = createBrowserRouter([
  { path: '/', element: <PlannerPage /> },
  { path: '/trips/:id', element: <TripPage /> },
  { path: '*', element: <NotFoundPage /> },
]);
```

```tsx
// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';
import 'leaflet/dist/leaflet.css';
import './index.css';
import { Providers } from '@/app/providers';
import { router } from '@/app/router';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </StrictMode>,
);
```

Add the toast container from the shadcn `toast` docs to `Providers` once you first need a toast.

### 10.5 Forms (pattern)

```ts
// src/features/trip-form/schema.ts
import { z } from 'zod';

const location = z.object({ label: z.string().min(1), lat: z.number(), lng: z.number() });

export const tripFormSchema = z.object({
  current: location,
  pickup: location,
  dropoff: location,
  cycle_used_hrs: z.number().min(0).max(70).multipleOf(0.25),
});
export type TripFormValues = z.infer<typeof tripFormSchema>;
```

```tsx
const form = useForm<TripFormValues>({ resolver: zodResolver(tripFormSchema) });
// render with shadcn <Field> components per ui.shadcn.com/docs/forms/react-hook-form
```

### 10.6 Map note (Leaflet)

- `leaflet/dist/leaflet.css` must be imported (done in `main.tsx`), and the map container needs an explicit height.
- Use custom SVG/`divIcon` markers for stop types. That also avoids Leaflet's default-icon path issue with bundlers.
- Tiles: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` with OSM attribution, or CARTO light tiles for a cleaner look.

### 10.7 Time formatting in home-terminal time

```ts
import { format } from 'date-fns';
import { TZDate } from '@date-fns/tz';

export const formatHomeTime = (iso: string, tz: string, pattern = 'MMM d, h:mm a') =>
  format(new TZDate(iso, tz), pattern);
```

---

## 11. Test setup

```ts
// src/test/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';
export const server = setupServer(...handlers);
```

```ts
// src/test/handlers.ts  (fixtures are synced from the API repo in W5)
import { http, HttpResponse } from 'msw';
const API = 'http://localhost:8000/api';
export const handlers = [http.get(`${API}/health/`, () => HttpResponse.json({ status: 'ok' }))];
```

```ts
// src/test/setup.ts
import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());
```

Create `.env.test` with `VITE_API_BASE_URL=http://localhost:8000/api` so the axios base URL matches the MSW handlers.

**First red → green (W0-02):**

```tsx
// src/App.test.tsx
import { render, screen } from '@testing-library/react';
import App from './App';

it('shows the product heading', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /eld trip planner/i })).toBeInTheDocument();
});
```

```bash
npm run test:run     # red
# App.tsx: return <h1 className="text-2xl font-semibold">ELD Trip Planner</h1>
npm run test:run     # green
```

(When the router is in place, render `<App />` pages through a test helper that wraps `Providers` and a
`createMemoryRouter`.)

---

## 12. Recommended VS Code extensions

ESLint · Prettier · Tailwind CSS IntelliSense · Playwright Test for VS Code · Vitest · Python + Ruff (for the API repo).

## 13. Verification checklist

- [ ] `npm run dev` shows the app at http://localhost:5173
- [ ] A shadcn `<Button>` renders with theme styles (Tailwind + CSS variables working)
- [ ] `@/` imports resolve in the editor **and** in `npm run build`
- [ ] `npm run test:run` green · `npm run typecheck` clean · `npm run lint` clean
- [ ] `npm run build` succeeds (this is what Vercel runs)
- [ ] `.env.local` not committed; `.env.example` committed
- [ ] With the API running: the browser Network tab shows `GET /api/health/` → 200 and no CORS error

## 14. Common problems

| Symptom | Fix |
|---|---|
| `Cannot find module '@/…'` | Alias missing from `tsconfig.app.json` **or** `vite.config.ts` (both are needed) |
| shadcn `init` can't find Tailwind or the alias | Finish §3 and §4 first, then rerun `npx shadcn@latest init` |
| Unstyled shadcn components | `src/index.css` must start with `@import "tailwindcss";` and be imported in `main.tsx` |
| Grey/broken map tiles | Import `leaflet/dist/leaflet.css`; give the map container a height |
| Vitest picks up Playwright specs | Keep `test.include` limited to `src/**` (§4) |
| `/trips/:id` 404 on Vercel refresh | Add `vercel.json` rewrite (§8.3) |
| CORS error | Add the exact web origin to the API's `CORS_ALLOWED_ORIGINS` on Render |
| Requests fail after the API has been idle | Expected on the Render free tier; the 90 s timeout + retry + wake banner handle it (AC-46) |
