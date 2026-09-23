import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function PlannerPage() {
  return (
    <section className="flex flex-col gap-8">
      <div className="flex max-w-2xl flex-col gap-2">
        <p className="text-muted-foreground text-sm font-medium">Hours-of-service planning</p>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Plan a compliant trip</h2>
        <p className="text-muted-foreground text-base">
          Enter your route and current cycle usage to generate required stops and daily driver logs.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,25rem)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Trip details</CardTitle>
            <CardDescription>
              Your route, schedule, and log information will go here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button type="button">Plan a trip</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Route preview</CardTitle>
            <CardDescription>
              The route map, required stops, and trip summary will appear after planning.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">No trip planned yet.</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
