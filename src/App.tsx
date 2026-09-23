import { Link, Outlet } from 'react-router';

export default function App() {
  return (
    <div className="bg-muted/30 min-h-svh">
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
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
