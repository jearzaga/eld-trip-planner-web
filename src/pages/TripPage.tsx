import { useEffect, useState } from 'react';
import { ArrowLeft, Check, Copy, TriangleAlert } from 'lucide-react';
import { Link, useLocation, useParams } from 'react-router';

import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LogSheetPager } from '@/features/log-sheets/LogSheetPager';
import { RouteInstructions } from '@/features/route-map/RouteInstructions';
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
    <section className="flex flex-col gap-7 sm:gap-8">
      <div className="bg-card flex flex-col gap-4 rounded-2xl border px-5 py-6 sm:px-8 sm:py-8">
        <Link
          to="/"
          className="text-primary focus-visible:ring-ring flex w-fit items-center gap-1.5 rounded-md text-sm font-medium focus-visible:ring-2"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Plan another trip
        </Link>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="flex min-w-0 flex-col gap-2">
            <p className="text-primary text-sm font-semibold">Saved trip plan</p>
            <h2 className="text-3xl font-semibold tracking-tight break-words sm:text-4xl">
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
            className="self-start"
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
      </div>

      <nav aria-label="Trip sections" className="flex flex-wrap gap-2">
        <a
          href="#trip-summary"
          className="bg-card hover:bg-muted focus-visible:ring-ring rounded-full border px-3 py-1.5 text-sm font-medium focus-visible:ring-2"
        >
          Summary
        </a>
        <a
          href="#route-and-stops"
          className="bg-card hover:bg-muted focus-visible:ring-ring rounded-full border px-3 py-1.5 text-sm font-medium focus-visible:ring-2"
        >
          Route and stops
        </a>
        <a
          href="#daily-logs"
          className="bg-card hover:bg-muted focus-visible:ring-ring rounded-full border px-3 py-1.5 text-sm font-medium focus-visible:ring-2"
        >
          Daily logs
        </a>
      </nav>

      <div id="trip-summary" className="scroll-mt-6">
        <SummaryCards trip={trip} />
      </div>

      <div
        id="route-and-stops"
        className="grid scroll-mt-6 items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(20rem,1fr)]"
      >
        <RouteMap trip={trip} />
        <div className="flex flex-col gap-6">
          <RouteInstructions trip={trip} />
          <StopsTimeline stops={trip.stops} timeZone={trip.summary.home_timezone} />
        </div>
      </div>

      <div id="daily-logs" className="scroll-mt-6">
        <LogSheetPager trip={trip} />
      </div>
    </section>
  );
}
