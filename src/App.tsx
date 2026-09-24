import { useEffect } from 'react';
import { Route } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router';

export default function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="bg-muted/40 min-h-svh">
      <a
        href="#main-content"
        className="bg-background focus:ring-ring sr-only z-60 rounded-md px-3 py-2 focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:ring-2"
      >
        Skip to main content
      </a>
      <header className="bg-background/95 border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            className="focus-visible:ring-ring flex items-center gap-3 rounded-md outline-none focus-visible:ring-2"
            to="/"
          >
            <span className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-lg">
              <Route aria-hidden="true" className="size-5" />
            </span>
            <span className="flex flex-col">
              <h1 className="text-base leading-tight font-semibold tracking-tight sm:text-lg">
                ELD Trip Planner
              </h1>
              <span className="text-muted-foreground hidden text-xs sm:block">
                Routes, stops, and driver logs
              </span>
            </span>
          </Link>
          <span className="text-muted-foreground hidden text-xs font-medium sm:block">
            Plan with confidence
          </span>
        </div>
      </header>
      <main
        id="main-content"
        className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
      >
        <Outlet />
      </main>
    </div>
  );
}
