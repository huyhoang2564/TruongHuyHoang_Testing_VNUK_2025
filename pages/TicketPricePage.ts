// pages/TicketPricePage.ts
import { Page, Locator } from '@playwright/test';

export class TicketPricePage {
  private readonly page: Page;
  private readonly ticketPriceTable: Locator;

  constructor(page: Page) {
    this.page = page;

    // By.id("ticketPriceTable")
    this.ticketPriceTable = page.locator('#ticketPriceTable');
  }

  // public boolean isTicketPriceTableDisplayed()
  async isTicketPriceTableDisplayed(): Promise<boolean> {
    return await this.ticketPriceTable.isVisible();
  }
}
