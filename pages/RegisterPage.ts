// pages/RegisterPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import type { RegisterForm } from '../models/RegisterForm';
import { DriverUtils } from '../utils/DriverUtils';

export class RegisterPage extends BasePage {
  private readonly emailInputLocator: Locator;
  private readonly passwordInputLocator: Locator;
  private readonly confirmPasswordInputLocator: Locator;
  private readonly pidInputLocator: Locator;

  private readonly registerButtonLocator: Locator;
  private readonly registerSuccessMessageLocator: Locator;
  private readonly registerErrorMessageLocator: Locator;

  constructor(page: Page) {
    super(page);

    this.emailInputLocator = page.locator('#email');
    this.passwordInputLocator = page.locator('#password');
    this.confirmPasswordInputLocator = page.locator('#confirmPassword');
    this.pidInputLocator = page.locator('#pid');

    this.registerButtonLocator = page.locator('input[type=submit]');
    this.registerSuccessMessageLocator = page.locator('#content p');
    this.registerErrorMessageLocator = page.locator('p.message.error');
  }

  // public String getRegisterSuccessMessage()
  async getRegisterSuccessMessage(): Promise<string> {
    return (await this.registerSuccessMessageLocator.innerText()).trim();
  }

  // public void register(RegisterForm form)
  async register(form: RegisterForm): Promise<void> {
    await this.enterEmail(form.email);
    await this.enterPassword(form.password);
    await this.enterConfirmPassword(form.confirmPassword);
    await this.enterPID(form.pid);

    await DriverUtils.scrollIntoView(this.registerButtonLocator);
    await this.clickRegisterButton();
  }

  private async enterEmail(email: string): Promise<void> {
    await this.emailInputLocator.fill(email);
  }

  private async enterPassword(password: string): Promise<void> {
    await this.passwordInputLocator.fill(password);
  }

  private async enterConfirmPassword(confirmPassword: string): Promise<void> {
    await this.confirmPasswordInputLocator.fill(confirmPassword);
  }

  private async enterPID(pid: string): Promise<void> {
    await this.pidInputLocator.fill(pid);
  }

  private async clickRegisterButton(): Promise<void> {
    await this.registerButtonLocator.click();
  }

  // (Java có locator error nhưng chưa có getter — mình không tự ý thêm method
  //  để bạn giữ “y hệt”; nếu bạn muốn mình sẽ thêm getRegisterErrorMessage())
}
