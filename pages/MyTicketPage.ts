// pages/MyTicketPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class MyTicketPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // === CHUẨN NHẤT ===
  async cancelTicketByID(id: number): Promise<void> {
    const cancelButton: Locator = this.page.locator(
      `//input[@value='Cancel'][@onclick='DeleteTicket(${id});']`
    );

    // BẮT ALERT TRƯỚC
    const dialogPromise = this.page.waitForEvent('dialog');

    // CLICK
    await cancelButton.click();

    // ACCEPT ALERT
    const dialog = await dialogPromise;
    await dialog.accept();
  }

  async isCancelTicketButtonDisplayed(id: number): Promise<boolean> {
    const cancelButton: Locator = this.page.locator(
      `//input[@value='Cancel'][@onclick='DeleteTicket(${id});']`
    );
    return (await cancelButton.count()) > 0;
  }
}
