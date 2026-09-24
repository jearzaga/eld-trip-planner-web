import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { formatDateTime, formatDurationMinutes, formatHours } from '../trip-results/format';
import type { TripPlan } from '../trip-results/schema';

export function SummaryCards({ trip }: { trip: TripPlan }) {
  const { summary } = trip;
  const durationMinutes = Math.round(
    (new Date(summary.end_at).getTime() - new Date(summary.start_at).getTime()) / 60_000,
  );
  const items = [
    ['Total miles', `${summary.total_miles.toLocaleString('en-US')} mi`, 'summary-total-miles'],
    ['Driving', formatHours(summary.total_driving_hrs), 'summary-driving-hrs'],
    ['Trip duration', formatDurationMinutes(durationMinutes), 'summary-duration'],
    ['Arrival', formatDateTime(summary.arrive_at, summary.home_timezone), 'summary-arrival'],
    ['Log sheets', String(summary.log_days), 'summary-log-days'],
    ['Required stops', String(summary.stop_count), 'summary-stop-count'],
  ] as const;

  return (
    <section aria-labelledby="trip-summary-title">
      <h2 id="trip-summary-title" className="mb-3 text-xl font-semibold tracking-tight">
        Trip summary
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {items.map(([label, value, testId]) => (
          <Card key={testId} size="sm" className="border-t-primary/50 border-t-2">
            <CardHeader>
              <CardTitle className="text-muted-foreground font-normal">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p data-testid={testId} className="text-lg font-semibold tracking-tight break-words">
                {value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
