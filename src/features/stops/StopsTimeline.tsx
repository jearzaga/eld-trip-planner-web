import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/stores/ui-store';

import { formatDateTime, formatDurationMinutes } from '../trip-results/format';
import type { TripStop } from '../trip-results/schema';

const stopLabels: Record<TripStop['type'], string> = {
  pickup: 'Pickup',
  fuel: 'Fuel',
  break_30: '30-minute break',
  rest_10: '10-hour rest',
  restart_34: '34-hour restart',
  dropoff: 'Drop-off',
};

export function StopsTimeline({ stops, timeZone }: { stops: TripStop[]; timeZone: string }) {
  const selectedStopSeq = useUiStore((state) => state.selectedStopSeq);
  const selectStop = useUiStore((state) => state.selectStop);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Required stops</CardTitle>
        <CardDescription>Select a stop to focus it on the route map.</CardDescription>
      </CardHeader>
      <CardContent>
        <ol data-testid="stops-timeline" className="flex flex-col gap-2">
          {stops.map((stop) => {
            const isSelected = stop.seq === selectedStopSeq;
            return (
              <li key={stop.seq}>
                <Button
                  type="button"
                  variant={isSelected ? 'secondary' : 'ghost'}
                  className={cn(
                    'h-auto w-full justify-start px-3 py-3 text-left whitespace-normal',
                    !isSelected && 'border border-transparent',
                  )}
                  data-testid="stop-item"
                  data-stop-type={stop.type}
                  data-seq={stop.seq}
                  aria-pressed={isSelected}
                  onClick={() => selectStop(stop.seq)}
                >
                  <span className="bg-muted flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                    {stop.seq}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{stop.label}</span>
                      <Badge variant="outline">{stopLabels[stop.type]}</Badge>
                    </span>
                    <span className="text-muted-foreground flex flex-wrap gap-x-1 text-xs">
                      <span>
                        {formatDateTime(stop.arrive_at, timeZone)} →{' '}
                        {formatDateTime(stop.depart_at, timeZone)}
                      </span>
                      <span aria-label="Stop duration">· {formatDurationMinutes(stop.duration_min)}</span>
                    </span>
                  </span>
                </Button>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
