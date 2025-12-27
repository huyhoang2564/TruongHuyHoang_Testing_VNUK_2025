
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

  private readonly pageContentLocator: Locator;
  private readonly allImagesLocator: Locator;
  private readonly allLinksLocator: Locator;
  private readonly allButtonsLocator: Locator;
  private readonly validationErrorLocator: Locator;

  constructor(page: Page) {
    super(page);

    this.emailInputLocator = page.locator('#email');
    this.passwordInputLocator = page.locator('#password');
    this.confirmPasswordInputLocator = page.locator('#confirmPassword');
    this.pidInputLocator = page.locator('#pid');

    this.registerButtonLocator = page.locator('input[type=submit]');
    this.registerSuccessMessageLocator = page.locator('#content p');
    this.registerErrorMessageLocator = page.locator('p.message.error');

    this.pageContentLocator = page.locator('body');
    this.allImagesLocator = page.locator('img');
    this.allLinksLocator = page.locator('a');
    this.allButtonsLocator = page.locator('button, input[type=submit], input[type=button]');
    this.validationErrorLocator = page.locator('.validation-error, label.error, span.error, .field-validation-error');
  }


  async getRegisterSuccessMessage(): Promise<string> {
    return (await this.registerSuccessMessageLocator.innerText()).trim();
  }


  async getRegisterErrorMessage(): Promise<string> {
    try {
      await this.registerErrorMessageLocator.waitFor({ state: 'visible', timeout: 5000 });
      return (await this.registerErrorMessageLocator.innerText()).trim();
    } catch {
      return '';
    }
  }

  /**
   * Get validation error message for any field
   */
  async getValidationErrorMessage(): Promise<string> {
    try {
      await this.validationErrorLocator.first().waitFor({ state: 'visible', timeout: 5000 });
      return (await this.validationErrorLocator.first().innerText()).trim();
    } catch {
      return '';
    }
  }

  /**
   * Check if validation error exists
   */
  async hasValidationError(): Promise<boolean> {
    try {
      await this.validationErrorLocator.first().waitFor({ state: 'visible', timeout: 5000 });
      return await this.validationErrorLocator.first().isVisible();
    } catch {
      return false;
    }
  }


  async register(form: RegisterForm): Promise<void> {
    await this.enterEmail(form.email);
    await this.enterPassword(form.password);
    await this.enterConfirmPassword(form.confirmPassword);
    await this.enterPID(form.pid);

    await DriverUtils.scrollIntoView(this.registerButtonLocator);
    await this.clickRegisterButton();
  }

  /**
   * Public method to enter email (for individual field testing)
   */
  async fillEmail(email: string): Promise<void> {
    await this.emailInputLocator.fill(email);
  }

  /**
   * Public method to enter password (for individual field testing)
   */
  async fillPassword(password: string): Promise<void> {
    await this.passwordInputLocator.fill(password);
  }

  /**
   * Public method to enter confirm password (for individual field testing)
   */
  async fillConfirmPassword(confirmPassword: string): Promise<void> {
    await this.confirmPasswordInputLocator.fill(confirmPassword);
  }

  /**
   * Public method to enter PID (for individual field testing)
   */
  async fillPID(pid: string): Promise<void> {
    await this.pidInputLocator.fill(pid);
  }

  /**
   * Public method to click register button
   */
  async clickRegister(): Promise<void> {
    await DriverUtils.scrollIntoView(this.registerButtonLocator);
    await this.registerButtonLocator.click();
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

  /**
   * Check if there are any broken images on the page
   */
  async getAllBrokenImages(): Promise<string[]> {
    const brokenImages: string[] = [];
    const images = await this.allImagesLocator.all();

    for (const img of images) {
      const src = await img.getAttribute('src');
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);

      if (naturalWidth === 0 || !src) {
        brokenImages.push(src || 'unknown');
      }
    }

    return brokenImages;
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
   * Check hover state on buttons
   */
  async checkButtonsHoverState(): Promise<boolean> {
    const buttons = await this.allButtonsLocator.all();

    for (const button of buttons) {
      await button.hover();
      await this.page.waitForTimeout(100);
    }

    return true;
  }

  /**
   * Check tab index navigation
   */
  async checkTabIndexNavigation(): Promise<boolean> {
    for (let i = 0; i < 10; i++) {
      await this.page.keyboard.press('Tab');
      await this.page.waitForTimeout(100);
    }
    return true;
  }

  /**
   * Check if password field is masked (type="password")
   */
  async isPasswordFieldMasked(): Promise<boolean> {
    const inputType = await this.passwordInputLocator.getAttribute('type');
    return inputType === 'password';
  }

  /**
   * Check if confirm password field is masked (type="password")
   */
  async isConfirmPasswordFieldMasked(): Promise<boolean> {
    const inputType = await this.confirmPasswordInputLocator.getAttribute('type');
    return inputType === 'password';
  }

  /**
   * Get the visible value of password field (should be masked)
   */
  async getPasswordFieldValue(): Promise<string> {
    return await this.passwordInputLocator.inputValue();
  }

  /**
   * Navigate to register page (for error testing)
   */
  async navigateToRegisterPageDirectly(): Promise<void> {
    await this.page.goto('http://railwayb2.somee.com/Account/Register');
  }

  /**
   * Check if register page loaded successfully
   */
  async isRegisterPageLoaded(): Promise<boolean> {
    try {
      await this.emailInputLocator.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }
}
