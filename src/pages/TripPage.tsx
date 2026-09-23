import { useEffect, useState } from 'react';
import { Check, Copy, TriangleAlert } from 'lucide-react';
import { useLocation, useParams } from 'react-router';

import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LogSheetPager } from '@/features/log-sheets/LogSheetPager';
import { RouteMap } from '@/features/route-map/RouteMap';
import { StopsTimeline } from '@/features/stops/StopsTimeline';
import { SummaryCards } from '@/features/summary/SummaryCards';
import { formatDateTime } from '@/features/trip-results/format';
import { useTrip } from '@/features/trip-results/useTrip';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useUiStore } from '@/stores/ui-store';

function TripLoading() {
  return (
    <div data-testid="trip-loading" className="flex flex-col gap-6" aria-label="Loading trip plan">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-9 w-3/4 max-w-xl" />
        <Skeleton className="h-5 w-80 max-w-full" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-24" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(20rem,1fr)]">
        <Skeleton className="h-[36rem]" />
        <Skeleton className="h-[36rem]" />
      </div>
    </div>
  );
}

export function TripPage() {
  const { id } = useParams();
  const location = useLocation();
  const [copied, setCopied] = useState(false);
  const selectStop = useUiStore((state) => state.selectStop);
  const { data: trip, error, isPending, refetch } = useTrip(id);
  useDocumentTitle(
    trip ? `${trip.inputs.current.label} to ${trip.inputs.dropoff.label}` : 'Trip plan',
  );

  useEffect(() => {
    selectStop(null);
  }, [id, selectStop]);

  if (isPending) {
    return <TripLoading />;
  }

  if (error || !trip) {
    return (
      <Alert variant="destructive" data-testid="error-banner">
        <TriangleAlert aria-hidden="true" />
        <AlertTitle>Trip plan unavailable</AlertTitle>
        <AlertDescription>
          We could not load this saved trip. Check the link or try again.
        </AlertDescription>
        <AlertAction>
          <Button
            variant="outline"
            size="sm"
            data-testid="error-retry"
            onClick={() => void refetch()}
          >
            Try again
          </Button>
        </AlertAction>
      </Alert>
    );
  }

  const copyLink = async () => {
    const url = new URL(location.pathname, window.location.origin).toString();
    await navigator.clipboard.writeText(url);
    setCopied(true);
  };

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="flex min-w-0 flex-col gap-2">
          <p className="text-muted-foreground text-sm font-medium">Saved trip plan</p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {trip.inputs.current.label} → {trip.inputs.dropoff.label}
          </h2>
          <p className="text-muted-foreground">
            Starts {formatDateTime(trip.summary.start_at, trip.summary.home_timezone)} · Arrives{' '}
            {formatDateTime(trip.summary.arrive_at, trip.summary.home_timezone)}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          data-testid="btn-copy-link"
          onClick={() => void copyLink()}
        >
          {copied ? (
            <Check data-icon="inline-start" aria-hidden="true" />
          ) : (
            <Copy data-icon="inline-start" aria-hidden="true" />
          )}
          {copied ? 'Link copied' : 'Copy link'}
        </Button>
      </div>

      <SummaryCards trip={trip} />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(20rem,1fr)]">
        <RouteMap trip={trip} />
        <StopsTimeline stops={trip.stops} timeZone={trip.summary.home_timezone} />
      </div>

      <LogSheetPager trip={trip} />
    </section>
  );
}
