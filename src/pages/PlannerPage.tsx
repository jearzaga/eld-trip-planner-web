import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { WakeBanner } from '@/features/server-status/WakeBanner';
import { useServerStatus } from '@/features/server-status/useServerStatus';
import { planTrip } from '@/features/trip-form/api';
import { TripForm } from '@/features/trip-form/TripForm';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Map } from 'lucide-react';
import { useNavigate } from 'react-router';

export function PlannerPage() {
  const navigate = useNavigate();
  const serverStatus = useServerStatus();
  useDocumentTitle('Plan a trip');

  return (
    <section className="flex flex-col gap-8">
      <div className="flex max-w-2xl flex-col gap-2">
        <p className="text-muted-foreground text-sm font-medium">Hours-of-service planning</p>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Plan a compliant trip</h2>
        <p className="text-muted-foreground text-base">
          Enter your route and current cycle usage to generate required stops and daily driver logs.
        </p>
      </div>

      {serverStatus.showWakeBanner ? <WakeBanner /> : null}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,27rem)_minmax(0,1fr)]">
        <TripForm onSubmit={planTrip} onPlanned={(id) => navigate(`/trips/${id}`)} />

        <Card>
          <CardHeader>
            <CardTitle>Route preview</CardTitle>
            <CardDescription>
              The route map, required stops, and trip summary will appear after planning.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Empty className="min-h-64 border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Map aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle>No trip planned yet</EmptyTitle>
                <EmptyDescription>
                  Complete the trip details to see the route, required stops, and daily logs.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
