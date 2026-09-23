import { useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router';

export default function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="bg-muted/30 min-h-svh">
      <a
        href="#main-content"
        className="bg-background focus:ring-ring sr-only z-60 rounded-md px-3 py-2 focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:ring-2"
      >
        Skip to main content
      </a>
      <header className="bg-background border-b">
        <div className="mx-auto flex max-w-7xl items-center px-4 py-4 sm:px-6 lg:px-8">
          <Link
            className="focus-visible:ring-ring rounded-md outline-none focus-visible:ring-2"
            to="/"
          >
            <h1 className="text-lg font-semibold tracking-tight">ELD Trip Planner</h1>
          </Link>
        </div>
      </header>
      <main id="main-content" className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
