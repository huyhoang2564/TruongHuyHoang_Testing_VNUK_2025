// pages/ContactPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ContactPage extends BasePage {
  private readonly emailTextBoxLocator: Locator;

  constructor(page: Page) {
    super(page);
    // XPath giống đúng ý Java
    this.emailTextBoxLocator = page.locator('//a[@href="mailto:thanh.viet.le@logigear.com"]');
  }

  // public void clickOnlickEmail()
  async clickOnlickEmail(): Promise<void> {
    await this.emailTextBoxLocator.click();
  }
}
