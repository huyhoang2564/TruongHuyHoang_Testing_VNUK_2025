import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class TicketPricePage extends BasePage {
  private readonly routeTable: Locator;
  private readonly routeRows: Locator;

  private readonly priceTable: Locator;
  private readonly priceRows: Locator;

  constructor(page: Page) {
    super(page);

    this.routeTable = page.locator('table.MyTable').first();
    this.routeRows = this.routeTable.locator('tbody tr');

    this.priceTable = page.locator('table.MyTable').last();
    this.priceRows = this.priceTable.locator('tbody tr');
  }

  async isTicketPriceTableDisplayed(): Promise<boolean> {
    return await this.routeTable.isVisible();
  }

  async getHeaderNames(): Promise<string[]> {
    return await this.routeTable.locator('thead th').allInnerTexts();
  }

  async getRows(): Promise<Locator[]> {
    return await this.routeRows.all();
  }

  async clickCheckPrice(rowIndex: number): Promise<void> {
    const row = this.routeRows.nth(rowIndex - 1);
    const btn = row.getByRole('link', { name: /check price/i });

    await expect(btn).toBeVisible();
    await btn.click();

    await expect(this.priceTable).toBeVisible();
  }

  async getPriceRows(): Promise<Locator[]> {
    await expect(this.priceTable).toBeVisible();
    return await this.priceRows.all();
  }

  async clickFirstBookTicket(): Promise<void> {
    const row = this.priceRows.first();
    const btn = row.getByRole('link', { name: /book ticket/i });

    await expect(btn).toBeVisible();
    await btn.click();
  }

  async clickBookTicketBySeatType(seatTypeText: string): Promise<void> {
    const row = this.priceRows.filter({ hasText: seatTypeText }).first();
    const btn = row.getByRole('link', { name: /book ticket/i });

    await expect(btn).toBeVisible();
    await btn.click();
  }
}
