import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ContactPage extends BasePage {
  // Assuming the contact page has an email link as per previous file content
  private readonly emailLinkLocator: Locator;

  constructor(page: Page) {
    super(page);
    // Preserving the locator from before, assuming it's correct for the specific contact email
    this.emailLinkLocator = page.locator('//a[contains(@href, "mailto:")]');
  }

  async clickEmailLink(): Promise<void> {
    await this.emailLinkLocator.click();
  }
}
