// pages/TimetablePage.ts
import { Page, Locator } from '@playwright/test';

export class TimetablePage {
  private readonly page: Page;
  private readonly emailTextBoxLocator: Locator;

  constructor(page: Page) {
    this.page = page;

    // Java dùng cssSelector nhưng thực chất là XPath (//...)
    // Playwright: dùng locator với XPath cho đúng intent
    this.emailTextBoxLocator = page.locator(
      '//a[@href="mailto:thanh.viet.le@logigear.com"]'
    );
  }

  // public void clickOnlickEmail()
  async clickOnlickEmail(): Promise<void> {
    await this.emailTextBoxLocator.click();
  }
}
