import { useEffect, useMemo } from 'react';
import { divIcon, latLngBounds, type LatLngTuple } from 'leaflet';
import { Check, MapPinned, Navigation2 } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { RouteLocationField, RouteLocations } from '@/features/trip-form/TripForm';

const fields: { key: RouteLocationField; label: string }[] = [
  { key: 'current', label: 'Current location' },
  { key: 'pickup', label: 'Pickup' },
  { key: 'dropoff', label: 'Drop-off' },
];

const previewIcons = Object.fromEntries(
  fields.map(({ key }, index) => [
    key,
    divIcon({
      className: '',
      iconSize: [34, 34],
      iconAnchor: [17, 17],
      html: renderToStaticMarkup(
        <span
          data-testid={`preview-marker-${key}`}
          className="preview-map-pin"
          title={`${index + 1}. ${fields[index].label}`}
        >
          {index + 1}
        </span>,
      ),
    }),
  ]),
) as Record<RouteLocationField, ReturnType<typeof divIcon>>;

function FitWaypoints({ positions }: { positions: LatLngTuple[] }) {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
    if (positions.length > 1) {
      map.fitBounds(latLngBounds(positions), { animate: false, padding: [48, 48], maxZoom: 9 });
    } else if (positions.length === 1) {
      map.setView(positions[0], 8, { animate: false });
    } else {
      map.setView([39.5, -98.35], 4, { animate: false });
    }
  }, [map, positions]);

  return null;
}

export function RoutePreview({
  locations,
  drafts,
}: {
  locations: RouteLocations;
  drafts: Partial<Record<RouteLocationField, string>>;
}) {
  const waypoints = useMemo(
    () =>
      fields.flatMap(({ key, label }) => {
        const location = locations[key];
        return location
          ? [{ key, label, location, position: [location.lat, location.lng] as LatLngTuple }]
          : [];
      }),
    [locations],
  );
  const positions = useMemo(() => waypoints.map(({ position }) => position), [waypoints]);
  const segments = fields.slice(0, -1).flatMap(({ key }, index) => {
    const from = locations[key];
    const to = locations[fields[index + 1].key];
    return from && to
      ? [
          [
            [from.lat, from.lng],
            [to.lat, to.lng],
          ] as LatLngTuple[],
        ]
      : [];
  });

  return (
    <Card data-testid="route-preview" className="lg:sticky lg:top-6">
      <CardHeader className="gap-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <MapPinned aria-hidden="true" className="text-primary size-5" />
            <CardTitle>Live route preview</CardTitle>
          </div>
          <Badge variant={waypoints.length === 3 ? 'default' : 'secondary'}>
            {waypoints.length} of 3 pinned
          </Badge>
        </div>
        <CardDescription>
          Your selected places appear here as you plan. Choose a suggestion to pin each stop.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div
          data-testid="route-preview-map"
          aria-label="Selected trip waypoints map"
          className="relative h-64 w-full overflow-hidden rounded-xl border sm:h-72 lg:h-80"
        >
          <MapContainer
            className="h-full w-full"
            center={[39.5, -98.35]}
            zoom={4}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitWaypoints positions={positions} />
            {segments.map((segment, index) => (
              <Polyline
                key={index}
                positions={segment}
                pathOptions={{
                  color: 'var(--primary)',
                  dashArray: '5 9',
                  opacity: 0.85,
                  weight: 3,
                }}
              />
            ))}
            {waypoints.map(({ key, location, position }) => (
              <Marker
                key={key}
                position={position}
                icon={previewIcons[key]}
                title={location.label}
              />
            ))}
          </MapContainer>
          {waypoints.length === 0 ? (
            <div className="bg-background/95 pointer-events-none absolute inset-x-4 top-4 z-400 rounded-lg border px-3 py-2 text-sm shadow-sm">
              <span className="flex items-center gap-2 font-medium">
                <Navigation2 aria-hidden="true" className="text-primary size-4" />
                Start with your current location
              </span>
            </div>
          ) : null}
        </div>

        <ol className="grid gap-2" aria-label="Route waypoints">
          {fields.map(({ key, label }, index) => {
            const location = locations[key];
            const draft = drafts[key]?.trim();
            return (
              <li
                key={key}
                data-testid={`preview-${key}`}
                className="bg-muted/30 flex min-w-0 items-center gap-3 rounded-lg border px-3 py-2.5"
              >
                <span className="bg-background text-primary flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="text-muted-foreground block text-xs font-medium">{label}</span>
                  <span className="block truncate text-sm font-medium">
                    {location?.label ?? draft ?? 'Choose a place'}
                  </span>
                </span>
                <span className="text-muted-foreground shrink-0 text-xs">
                  {location ? (
                    <span className="text-primary flex items-center gap-1 font-medium">
                      <Check aria-hidden="true" className="size-3.5" /> Pinned
                    </span>
                  ) : draft ? (
                    'Select a result'
                  ) : (
                    'Not set'
                  )}
                </span>
              </li>
            );
          })}
        </ol>
        <p className="text-muted-foreground border-t pt-3 text-xs leading-relaxed">
          Dotted lines show waypoint order only. The road route, required stops, and daily logs
          appear after you select <span className="text-foreground font-medium">Plan trip</span>.
        </p>
      </CardContent>
    </Card>
  );
}
