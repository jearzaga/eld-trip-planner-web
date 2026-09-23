import { useEffect, useMemo, useRef, type ComponentType } from 'react';
import {
  BedDouble,
  Coffee,
  Fuel,
  MapPinCheck,
  Navigation,
  PackageOpen,
  TimerReset,
} from 'lucide-react';
import {
  divIcon,
  latLngBounds,
  type DivIcon,
  type LatLngExpression,
  type Marker as LeafletMarker,
  type Polyline as LeafletPolyline,
} from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUiStore } from '@/stores/ui-store';

import { formatDateTime, formatDurationMinutes } from '../trip-results/format';
import type { TripPlan, TripStop } from '../trip-results/schema';

type MarkerKind = 'start' | TripStop['type'];
type IconComponent = ComponentType<{ 'aria-hidden'?: boolean; size?: number; strokeWidth?: number }>;

const markerConfig: Record<MarkerKind, { label: string; icon: IconComponent }> = {
  start: { label: 'Start', icon: Navigation },
  pickup: { label: 'Pickup', icon: PackageOpen },
  dropoff: { label: 'Drop-off', icon: MapPinCheck },
  fuel: { label: 'Fuel', icon: Fuel },
  break_30: { label: '30-minute break', icon: Coffee },
  rest_10: { label: '10-hour rest', icon: BedDouble },
  restart_34: { label: '34-hour restart', icon: TimerReset },
};

function createMarkerIcon(kind: MarkerKind): DivIcon {
  const Icon = markerConfig[kind].icon;
  const html = renderToStaticMarkup(
    <div
      data-testid={`marker-${kind}`}
      title={markerConfig[kind].label}
      style={{
        alignItems: 'center',
        background: 'var(--primary)',
        border: '3px solid var(--background)',
        borderRadius: '9999px',
        boxShadow: '0 2px 8px color-mix(in oklch, var(--foreground) 24%, transparent)',
        color: 'var(--primary-foreground)',
        display: 'flex',
        height: 34,
        justifyContent: 'center',
        width: 34,
      }}
    >
      <Icon aria-hidden size={17} strokeWidth={2.25} />
    </div>,
  );

  return divIcon({
    className: '',
    html,
    iconAnchor: [17, 17],
    iconSize: [34, 34],
    popupAnchor: [0, -19],
  });
}

const markerIcons = Object.fromEntries(
  (Object.keys(markerConfig) as MarkerKind[]).map((kind) => [kind, createMarkerIcon(kind)]),
) as Record<MarkerKind, DivIcon>;

function FitRoute({ positions }: { positions: LatLngExpression[] }) {
  const map = useMap();

  useEffect(() => {
    if (positions.length > 1) {
      map.fitBounds(latLngBounds(positions), { padding: [36, 36] });
    }
  }, [map, positions]);

  return null;
}

function RouteLine({ positions }: { positions: LatLngExpression[] }) {
  const lineRef = useRef<LeafletPolyline>(null);

  useEffect(() => {
    lineRef.current?.getElement()?.setAttribute('data-testid', 'route-polyline');
  }, []);

  return (
    <Polyline ref={lineRef} positions={positions} pathOptions={{ color: 'var(--primary)', weight: 5 }} />
  );
}

function StopMarker({ stop, timeZone }: { stop: TripStop; timeZone: string }) {
  const map = useMap();
  const markerRef = useRef<LeafletMarker>(null);
  const selectedStopSeq = useUiStore((state) => state.selectedStopSeq);
  const selectStop = useUiStore((state) => state.selectStop);

  useEffect(() => {
    if (selectedStopSeq === stop.seq) {
      map.flyTo([stop.lat, stop.lng], Math.max(map.getZoom(), 8));
      markerRef.current?.openPopup();
    }
  }, [map, selectedStopSeq, stop.lat, stop.lng, stop.seq]);

  return (
    <Marker
      ref={markerRef}
      position={[stop.lat, stop.lng]}
      icon={markerIcons[stop.type]}
      eventHandlers={{ click: () => selectStop(stop.seq) }}
    >
      <Popup>
        <div className="min-w-48">
          <p className="font-semibold">{stop.label}</p>
          <p className="text-muted-foreground text-sm">{markerConfig[stop.type].label}</p>
          <p className="mt-2 text-sm">
            {formatDateTime(stop.arrive_at, timeZone)} →{' '}
            {formatDateTime(stop.depart_at, timeZone)}
          </p>
          <p className="text-sm">Stop duration: {formatDurationMinutes(stop.duration_min)}</p>
        </div>
      </Popup>
    </Marker>
  );
}

function MapLegend() {
  return (
    <div data-testid="map-legend" aria-label="Map legend" className="flex flex-wrap gap-2">
      {(Object.keys(markerConfig) as MarkerKind[]).map((kind) => {
        const Icon = markerConfig[kind].icon;
        return (
          <Badge key={kind} variant="outline">
            <Icon aria-hidden data-icon="inline-start" />
            {markerConfig[kind].label}
          </Badge>
        );
      })}
    </div>
  );
}

export function RouteMap({ trip }: { trip: TripPlan }) {
  const positions = useMemo<LatLngExpression[]>(
    () => trip.route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    [trip.route.geometry.coordinates],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Route map</CardTitle>
        <CardDescription>
          Select a required stop in the timeline or directly on the map.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div data-testid="route-map" className="h-[28rem] w-full overflow-hidden rounded-lg border">
          <MapContainer
            className="h-full w-full"
            center={[trip.inputs.current.lat, trip.inputs.current.lng]}
            zoom={6}
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitRoute positions={positions} />
            <RouteLine positions={positions} />
            <Marker
              position={[trip.inputs.current.lat, trip.inputs.current.lng]}
              icon={markerIcons.start}
            >
              <Popup>{trip.inputs.current.label}</Popup>
            </Marker>
            {trip.stops.map((stop) => (
              <StopMarker key={stop.seq} stop={stop} timeZone={trip.summary.home_timezone} />
            ))}
          </MapContainer>
        </div>
        <MapLegend />
      </CardContent>
    </Card>
  );
}
