import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { formatHours } from '../trip-results/format';
import type { TripPlan } from '../trip-results/schema';

export function RouteInstructions({ trip }: { trip: TripPlan }) {
  const places: Record<string, string> = {
    current: trip.inputs.current.label,
    pickup: trip.inputs.pickup.label,
    dropoff: trip.inputs.dropoff.label,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Route instructions</CardTitle>
        <CardDescription>Drive each leg in order. Required stops are listed below.</CardDescription>
      </CardHeader>
      <CardContent>
        <ol data-testid="route-legs" className="flex flex-col gap-2">
          {trip.route.legs.map((leg, index) => (
            <li
              key={`${leg.from}-${leg.to}`}
              data-testid="route-leg"
              className="flex items-start gap-3 rounded-lg border px-3 py-2"
            >
              <span className="bg-muted flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                {index + 1}
              </span>
              <span className="flex flex-col gap-1">
                <span className="font-medium">
                  {places[leg.from] ?? leg.from} → {places[leg.to] ?? leg.to}
                </span>
                <span className="text-muted-foreground text-sm">
                  {leg.distance_mi.toLocaleString('en-US')} mi · {formatHours(leg.duration_hrs)}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
