import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ChangePasswordPage extends BasePage {
  private readonly currentPasswordTextBoxLocator: Locator;
  private readonly newPasswordTextBoxLocator: Locator;
  private readonly confirmPasswordTextBoxLocator: Locator;
  private readonly changePasswordButtonLocator: Locator;

  private readonly messageSuccessLocator: Locator;
  private readonly messageErrorLocator: Locator;

  constructor(page: Page) {
    super(page);

    this.currentPasswordTextBoxLocator = page.locator('#currentPassword');
    this.newPasswordTextBoxLocator = page.locator('#newPassword');
    this.confirmPasswordTextBoxLocator = page.locator('#confirmPassword');

    this.changePasswordButtonLocator = page.locator("input[value='Change Password']");
    this.messageSuccessLocator = page.locator('p.message.success');
    this.messageErrorLocator = page.locator('p.message.error');
  }

  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string): Promise<void> {
    await this.currentPasswordTextBoxLocator.fill(currentPassword);
    await this.newPasswordTextBoxLocator.fill(newPassword);
    await this.confirmPasswordTextBoxLocator.fill(confirmPassword);

    // Click ổn định (tương đương JS click Selenium)
    await this.changePasswordButtonLocator.evaluate((el) => (el as HTMLElement).click());
  }

  async getErrorMessage(): Promise<string> {
    // đợi message hiện ra để test không flaky
    await this.messageErrorLocator.waitFor({ state: 'visible', timeout: 10_000 });
    return (await this.messageErrorLocator.innerText()).trim();
  }

  async getSuccessMessage(): Promise<string> {
    await this.messageSuccessLocator.waitFor({ state: 'visible', timeout: 10_000 });
    return (await this.messageSuccessLocator.innerText()).trim();
  }
}
