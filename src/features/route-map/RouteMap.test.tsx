import { forwardRef, type ReactNode } from 'react';
import { screen } from '@testing-library/react';

import { RouteMap } from '@/features/route-map/RouteMap';
import { tripPlanSchema } from '@/features/trip-results/schema';
import twoDayTrip from '@/test/fixtures/sc2.json';
import { renderWithProviders } from '@/test/render';

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: ReactNode }) => (
    <div data-testid="route-map">{children}</div>
  ),
  Marker: forwardRef(
    ({ children, icon }: { children: ReactNode; icon: { options: { html: string } } }) => (
      <div>
        <div dangerouslySetInnerHTML={{ __html: icon.options.html }} />
        {children}
      </div>
    ),
  ),
  Polyline: forwardRef(() => <div data-testid="route-polyline" />),
  Popup: ({ children }: { children: ReactNode }) => <>{children}</>,
  TileLayer: ({ url }: { url: string }) => <div data-testid="tile-layer" data-url={url} />,
  useMap: () => ({ fitBounds: vi.fn(), flyTo: vi.fn() }),
}));

describe('RouteMap', () => {
  it('renders the route, typed markers, and complete legend', () => {
    renderWithProviders(<RouteMap trip={tripPlanSchema.parse(twoDayTrip)} />);

    expect(screen.getByTestId('route-polyline')).toBeInTheDocument();
    expect(screen.getByTestId('marker-start')).toBeInTheDocument();
    expect(screen.getByTestId('marker-pickup')).toBeInTheDocument();
    expect(screen.getByTestId('marker-dropoff')).toBeInTheDocument();
    expect(screen.getByTestId('map-legend')).toHaveTextContent(
      /Start.*Pickup.*Drop-off.*Fuel.*30-minute break.*10-hour rest.*34-hour restart/,
    );
  });

  it('loads the standard OpenStreetMap tiles', () => {
    renderWithProviders(<RouteMap trip={tripPlanSchema.parse(twoDayTrip)} />);

    expect(screen.getByTestId('tile-layer')).toHaveAttribute(
      'data-url',
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    );
  });

  it('describes each stop in its marker popup without a dialog role', () => {
    renderWithProviders(<RouteMap trip={tripPlanSchema.parse(twoDayTrip)} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('near Dayton, OH').parentElement).toHaveTextContent(
      /near Dayton, OH.*30-minute break.*Stop duration: 30 min/,
    );
  });
});
