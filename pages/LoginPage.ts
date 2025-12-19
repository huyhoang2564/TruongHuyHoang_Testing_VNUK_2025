// pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import type { User } from '../models/User';
import { DriverUtils } from '../utils/DriverUtils';

export class LoginPage extends BasePage {
  // Java: WebDriver driver; (không cần trong Playwright)

  private readonly emailTextBoxLocator: Locator;
  private readonly passwordTextBoxLocator: Locator;
  private readonly loginButtonLocator: Locator;

  private readonly messageErrorLocator: Locator;
  private readonly messageUsernameErrorLocator: Locator;
  private readonly messagePasswordErrorLocator: Locator;

  constructor(page: Page) {
    super(page);

    this.emailTextBoxLocator = page.locator('#username');
    this.passwordTextBoxLocator = page.locator('#password');
    this.loginButtonLocator = page.locator("input[value='Login']");

    this.messageErrorLocator = page.locator('p.message');

    this.messageUsernameErrorLocator = page.locator(
      "//label[contains(@class, 'validation-error') and contains(text(), 'You must specify a username.')]"
    );

    this.messagePasswordErrorLocator = page.locator(
      "//label[contains(@class, 'validation-error') and contains(text(), 'You must specify a password.')]"
    );
  }

  // private WebElement getLoginButton()
  private getLoginButton(): Locator {
    return this.loginButtonLocator;
  }

  // public void login(User user)
  async login(user: User): Promise<void> {
    await this.enterEmail(user.email);
    await this.enterPassword(user.password);

    await DriverUtils.scrollIntoView(this.getLoginButton());
    await this.clickLoginButton();
  }

  private async enterEmail(email: string): Promise<void> {
    await this.emailTextBoxLocator.fill(email);
  }

  private async enterPassword(password: string): Promise<void> {
    await this.passwordTextBoxLocator.fill(password);
  }

  // public String getErrorMessage()
  async getErrorMessage(): Promise<string> {
    return (await this.messageErrorLocator.innerText()).trim();
  }

  // public String getMessagePasswordError()
  async getMessagePasswordError(): Promise<string> {
    // Java code bị swap locator ở đây. TS trả đúng "password error".
    return (await this.messagePasswordErrorLocator.innerText()).trim();
  }

  // public String getMessageUsernameError()
  async getMessageUsernameError(): Promise<string> {
    // Java code bị swap locator ở đây. TS trả đúng "username error".
    return (await this.messageUsernameErrorLocator.innerText()).trim();
  }

  // public boolean isDisplayed()
  async isDisplayed(): Promise<boolean> {
    try {
      // Java: WebDriverWait 10s visibilityOfElementLocated(p.message)
      await this.messageErrorLocator.waitFor({ state: 'visible', timeout: 10_000 });
      return await this.messageErrorLocator.isVisible();
    } catch {
      return false;
    }
  }

  private async clickLoginButton(): Promise<void> {
    await this.getLoginButton().click();
  }
}
