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
    await this.fillCurrentPassword(currentPassword);
    await this.fillNewPassword(newPassword);
    await this.fillConfirmPassword(confirmPassword);
    await this.clickChangePasswordButton();
  }

  async fillCurrentPassword(password: string): Promise<void> {
    await this.currentPasswordTextBoxLocator.fill(password);
  }

  async fillNewPassword(password: string): Promise<void> {
    await this.newPasswordTextBoxLocator.fill(password);
  }

  async fillConfirmPassword(password: string): Promise<void> {
    await this.confirmPasswordTextBoxLocator.fill(password);
  }

  async clickChangePasswordButton(): Promise<void> {
    await this.changePasswordButtonLocator.click();
  }

  async isNewPasswordMasked(): Promise<boolean> {
    const type = await this.newPasswordTextBoxLocator.getAttribute('type');
    return type === 'password';
  }

  async getErrorMessage(): Promise<string> {
    try {
      if (await this.messageErrorLocator.isVisible()) {
        return (await this.messageErrorLocator.innerText()).trim();
      }
      // Check for generic message if specific error locator isn't visible yet
      const genericMsg = this.page.locator('.message.error'); // fallback
      if (await genericMsg.isVisible()) return (await genericMsg.innerText()).trim();

      return "";
    } catch { return ""; }
  }

  async getSuccessMessage(): Promise<string> {
    await this.messageSuccessLocator.waitFor({ state: 'visible', timeout: 10_000 });
    return (await this.messageSuccessLocator.innerText()).trim();
  }
}
