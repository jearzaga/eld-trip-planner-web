import { useCallback, useState } from 'react';
import { RoutePreview } from '@/features/route-map/RoutePreview';
import { WakeBanner } from '@/features/server-status/WakeBanner';
import { useServerStatus } from '@/features/server-status/useServerStatus';
import { planTrip } from '@/features/trip-form/api';
import {
  TripForm,
  type RouteLocationField,
  type RouteLocations,
} from '@/features/trip-form/TripForm';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ArrowDown, Route } from 'lucide-react';
import { useNavigate } from 'react-router';

export function PlannerPage() {
  const navigate = useNavigate();
  const serverStatus = useServerStatus();
  const [locations, setLocations] = useState<RouteLocations>({});
  const [drafts, setDrafts] = useState<Partial<Record<RouteLocationField, string>>>({});
  const updateDraft = useCallback((field: RouteLocationField, draft: string) => {
    setDrafts((current) => ({ ...current, [field]: draft }));
  }, []);
  useDocumentTitle('Plan a trip');

  return (
    <section className="flex flex-col gap-7 sm:gap-8">
      <div className="bg-card flex flex-col gap-4 rounded-2xl border px-5 py-6 sm:px-8 sm:py-8">
        <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-xl">
          <Route aria-hidden="true" className="size-5" />
        </div>
        <div className="flex max-w-3xl flex-col gap-2">
          <p className="text-primary text-sm font-semibold">Hours-of-service planning</p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Plan your next trip</h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            Add your stops and departure details. We’ll build the road route, required breaks, and
            daily driver logs.
          </p>
        </div>
        <a
          href="#trip-details"
          className="text-primary inline-flex w-fit items-center gap-1 text-sm font-medium lg:hidden"
        >
          Enter trip details <ArrowDown aria-hidden="true" className="size-4" />
        </a>
      </div>

      {serverStatus.showWakeBanner ? <WakeBanner /> : null}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,34rem)_minmax(0,1fr)]">
        <div id="trip-details" className="min-w-0 scroll-mt-6">
          <TripForm
            onSubmit={planTrip}
            onPlanned={(id) => navigate(`/trips/${id}`)}
            onLocationsChange={setLocations}
            onDraftChange={updateDraft}
          />
        </div>
        <RoutePreview locations={locations} drafts={drafts} />
      </div>
    </section>
  );
}
