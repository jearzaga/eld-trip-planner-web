import { Button } from '@/components/ui/button';

export default function App() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <section className="flex max-w-md flex-col items-center gap-4 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">ELD Trip Planner</h1>
        <p className="text-muted-foreground">
          Plan a compliant route and review every required driver log sheet.
        </p>
        <Button>Plan a trip</Button>
      </section>
    </main>
  );
}
