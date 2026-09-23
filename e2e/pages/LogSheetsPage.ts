import type { Locator, Page } from '@playwright/test';

export class LogSheetsPage {
  readonly page: Page;
  readonly sheets: Locator;
  readonly pager: Locator;
  readonly previousButton: Locator;
  readonly nextButton: Locator;
  readonly printButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sheets = page.getByTestId('log-sheet');
    this.pager = page.getByTestId('log-pager');
    this.previousButton = page.getByTestId('btn-prev-log');
    this.nextButton = page.getByTestId('btn-next-log');
    this.printButton = page.getByTestId('btn-print-logs');
  }

  sheet(day: number) {
    return this.page.locator(`[data-testid="log-sheet"][data-day="${day}"]`);
  }
}
