import type { Locator, Page } from '@playwright/test';

export class ResultsPage {
  readonly page: Page;
  readonly map: Locator;
  readonly routePolyline: Locator;
  readonly mapLegend: Locator;
  readonly stopsTimeline: Locator;
  readonly stopItems: Locator;
  readonly totalMiles: Locator;
  readonly drivingHours: Locator;
  readonly duration: Locator;
  readonly arrival: Locator;
  readonly logDays: Locator;
  readonly stopCount: Locator;
  readonly copyLinkButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.map = page.getByTestId('route-map');
    this.routePolyline = page.getByTestId('route-polyline');
    this.mapLegend = page.getByTestId('map-legend');
    this.stopsTimeline = page.getByTestId('stops-timeline');
    this.stopItems = page.getByTestId('stop-item');
    this.totalMiles = page.getByTestId('summary-total-miles');
    this.drivingHours = page.getByTestId('summary-driving-hrs');
    this.duration = page.getByTestId('summary-duration');
    this.arrival = page.getByTestId('summary-arrival');
    this.logDays = page.getByTestId('summary-log-days');
    this.stopCount = page.getByTestId('summary-stop-count');
    this.copyLinkButton = page.getByTestId('btn-copy-link');
  }

  async goto(tripId: string) {
    await this.page.goto(`/trips/${tripId}`);
  }
}
