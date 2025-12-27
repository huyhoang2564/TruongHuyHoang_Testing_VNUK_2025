
import { Page, Locator } from '@playwright/test';
import { Constant } from '../constants/Constant';

export class BasePage {
  protected readonly page: Page;

  public getCurrentUrl(): string {
    return this.page.url();
  }


  private readonly loginTabLocator: Locator;
  private readonly registerTabLocator: Locator;
  private readonly bookTicketTabLocator: Locator;
  private readonly myTicketTabLocator: Locator;
  private readonly ticketPriceTabLocator: Locator;
  private readonly timetableTabLocator: Locator;
  private readonly contactTabLocator: Locator;
  private readonly faqTabLocator: Locator;
  private readonly homeTabLocator: Locator;


  protected readonly logoutTabLocator: Locator;
  private readonly changePasswordTabLocator: Locator;


  private readonly greetingLabelLocator: Locator;
  private readonly headerLocator: Locator;

  constructor(page: Page) {
    this.page = page;


    this.loginTabLocator = page.locator("//a[span[text()='Login']]");
    this.registerTabLocator = page.locator("//a[span[text()='Register']]");
    this.bookTicketTabLocator = page.locator("//a[span[text()='Book ticket']]");
    this.myTicketTabLocator = page.locator("//a[span[text()='My ticket']]");
    this.ticketPriceTabLocator = page.locator("//a[span[text()='Ticket price']]");
    this.timetableTabLocator = page.locator("//a[span[text()='Timetable']]");
    this.contactTabLocator = page.locator("//a[span[text()='Contact']]");
    this.faqTabLocator = page.locator("//a[span[text()='FAQ']]");
    this.homeTabLocator = page.locator("//a[span[text()='Home']]");
    this.logoutTabLocator = page.locator("//a[span[text()='Log out']]");
    this.changePasswordTabLocator = page.locator("//a[span[text()='Change password']]");

    this.greetingLabelLocator = page.locator('div.account strong');
    this.headerLocator = page.locator('h1');
  }


  async getHeaderText(): Promise<string> {
    return (await this.headerLocator.innerText()).trim();
  }

  async getGreetingText(): Promise<string> {
    return (await this.greetingLabelLocator.innerText()).trim();
  }

  async goToLoginPage(): Promise<void> {
    await this.loginTabLocator.click();
  }

  async goToRegisterPage(): Promise<void> {
    await this.registerTabLocator.click();
  }

  async goToBookTicketPage(): Promise<void> {
    await this.bookTicketTabLocator.click();
  }

  async goToMyTicketPage(): Promise<void> {
    await this.myTicketTabLocator.click();
  }

  async goToTicketPricePage(): Promise<void> {
    await this.ticketPriceTabLocator.click();
  }

  async goToTimetablePage(): Promise<void> {
    await this.timetableTabLocator.click();
  }

  async goToContactPage(): Promise<void> {
    await this.contactTabLocator.click();
  }

  async goToFAQPage(): Promise<void> {
    await this.faqTabLocator.click();
  }

  async goToHomePage(): Promise<void> {
    await this.homeTabLocator.click();
  }

  async goToChangePasswordPage(): Promise<void> {
    await this.changePasswordTabLocator.click();
  }

  async goToLogoutPage(): Promise<void> {
    await this.logoutTabLocator.click();
  }

  async goToRestrictedPage(): Promise<void> {
    await this.page.goto(Constant.RAILWAY_URL);
  }

  /**
   * Check if there are any broken images on the page
   */
  async getAllBrokenImages(): Promise<string[]> {
    const brokenImages: string[] = [];
    const images = await this.page.locator('img').all();

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
   * Check hover state on buttons
   */
  async checkButtonsHoverState(): Promise<boolean> {
    const buttons = await this.page.locator('button, input[type=submit], input[type=button]').all();

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

  async getAllLinks(): Promise<Array<{ text: string; href: string }>> {
    const linksData: Array<{ text: string; href: string }> = [];
    const links = await this.page.locator('a').all();

    for (const link of links) {
      const text = await link.innerText().catch(() => '');
      const href = (await link.getAttribute('href')) || '';
      if (text.trim() && href) {
        linksData.push({ text: text.trim(), href });
      }
    }

    return linksData;
  }
}
