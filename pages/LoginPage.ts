
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import type { User } from '../models/User';
import { DriverUtils } from '../utils/DriverUtils';

export class LoginPage extends BasePage {

  private readonly emailTextBoxLocator: Locator;
  private readonly passwordTextBoxLocator: Locator;
  private readonly loginButtonLocator: Locator;

  private readonly messageErrorLocator: Locator;
  private readonly messageUsernameErrorLocator: Locator;
  private readonly messagePasswordErrorLocator: Locator;

  private readonly pageContentLocator: Locator;
  private readonly allImagesLocator: Locator;
  private readonly allLinksLocator: Locator;
  private readonly allButtonsLocator: Locator;

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

    this.pageContentLocator = page.locator('body');
    this.allImagesLocator = page.locator('img');
    this.allLinksLocator = page.locator('a');
    this.allButtonsLocator = page.locator('button, input[type=submit], input[type=button]');
  }


  private getLoginButton(): Locator {
    return this.loginButtonLocator;
  }


  async login(user: User): Promise<void> {
    await this.enterEmail(user.email);
    await this.enterPassword(user.password);

    await DriverUtils.scrollIntoView(this.getLoginButton());
    await this.clickLoginButton();
  }

  /**
   * Public method to enter email (for individual field testing)
   */
  async fillEmail(email: string): Promise<void> {
    await this.emailTextBoxLocator.fill(email);
  }

  /**
   * Public method to enter password (for individual field testing)
   */
  async fillPassword(password: string): Promise<void> {
    await this.passwordTextBoxLocator.fill(password);
  }

  /**
   * Public method to click login button
   */
  async clickLogin(): Promise<void> {
    await DriverUtils.scrollIntoView(this.getLoginButton());
    await this.loginButtonLocator.click();
  }

  private async enterEmail(email: string): Promise<void> {
    await this.emailTextBoxLocator.fill(email);
  }

  private async enterPassword(password: string): Promise<void> {
    await this.passwordTextBoxLocator.fill(password);
  }


  async getErrorMessage(): Promise<string> {
    return (await this.messageErrorLocator.innerText()).trim();
  }


  async getMessagePasswordError(): Promise<string> {

    return (await this.messagePasswordErrorLocator.innerText()).trim();
  }


  async getMessageUsernameError(): Promise<string> {

    return (await this.messageUsernameErrorLocator.innerText()).trim();
  }


  async isDisplayed(): Promise<boolean> {
    try {

      await this.messageErrorLocator.waitFor({ state: 'visible', timeout: 10_000 });
      return await this.messageErrorLocator.isVisible();
    } catch {
      return false;
    }
  }

  private async clickLoginButton(): Promise<void> {
    await this.getLoginButton().click();
  }


  /**
   * Get page content text
   */
  async getPageContentText(): Promise<string> {
    return await this.pageContentLocator.innerText();
  }

  /**
   * Get all links on the page
   */
  async getAllLinks(): Promise<Array<{ text: string; href: string }>> {
    const linksData: Array<{ text: string; href: string }> = [];
    const links = await this.allLinksLocator.all();

    for (const link of links) {
      const text = (await link.innerText()).trim();
      const href = (await link.getAttribute('href')) || '';
      if (text && href) {
        linksData.push({ text, href });
      }
    }

    return linksData;
  }



  /**
   * Check if password field is masked (type="password")
   */
  async isPasswordFieldMasked(): Promise<boolean> {
    const inputType = await this.passwordTextBoxLocator.getAttribute('type');
    return inputType === 'password';
  }

  /**
   * Check if email field is empty
   */
  async isEmailFieldEmpty(): Promise<boolean> {
    const value = await this.emailTextBoxLocator.inputValue();
    return value === '';
  }

  /**
   * Check if password field is empty
   */
  async isPasswordFieldEmpty(): Promise<boolean> {
    const value = await this.passwordTextBoxLocator.inputValue();
    return value === '';
  }

  /**
   * Check if username error is displayed
   */
  async isUsernameErrorDisplayed(): Promise<boolean> {
    try {
      await this.messageUsernameErrorLocator.waitFor({ state: 'visible', timeout: 5000 });
      return await this.messageUsernameErrorLocator.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Check if password error is displayed
   */
  async isPasswordErrorDisplayed(): Promise<boolean> {
    try {
      await this.messagePasswordErrorLocator.waitFor({ state: 'visible', timeout: 5000 });
      return await this.messagePasswordErrorLocator.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Attempt multiple failed logins
   */
  async attemptMultipleFailedLogins(user: User, attempts: number): Promise<void> {
    for (let i = 0; i < attempts; i++) {
      await this.enterEmail(user.email);
      await this.enterPassword(user.password);
      await this.clickLoginButton();

      // Wait for error message
      await this.page.waitForTimeout(1000);
    }
  }

  /**
   * Get cookies from the browser
   */
  async getCookies(): Promise<any[]> {
    return await this.page.context().cookies();
  }

  /**
   * Check if user is logged in (by checking greeting or logout button)
   */
  async isUserLoggedIn(): Promise<boolean> {
    try {
      return await this.logoutTabLocator.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Navigate to login page directly
   */
  async navigateToLoginPageDirectly(): Promise<void> {
    await this.page.goto('http://railwayb2.somee.com/Account/Login');
  }

  /**
   * Check if login page loaded successfully
   */
  async isLoginPageLoaded(): Promise<boolean> {
    try {
      await this.emailTextBoxLocator.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async goToForgotPasswordPage(): Promise<void> {
    await this.page.locator("//a[contains(text(),'Forgot Password')]").click();
  }
}
