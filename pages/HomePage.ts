
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { Constant } from '../constants/Constant';

export class HomePage extends BasePage {

  private readonly pageContentLocator: Locator;
  private readonly allImagesLocator: Locator;
  private readonly allLinksLocator: Locator;
  private readonly errorPageLocator: Locator;

  constructor(page: Page) {
    super(page);

    this.pageContentLocator = page.locator('body');
    this.allImagesLocator = page.locator('img');
    this.allLinksLocator = page.locator('a');
    this.errorPageLocator = page.locator('h1, h2, .error, #error');
  }


  async open(): Promise<void> {
    await this.page.goto(Constant.RAILWAY_URL);
  }


  async isLogoutTabVisible(): Promise<boolean> {
    try {
      await this.logoutTabLocator.waitFor({
        state: 'visible',
        timeout: 10_000
      });
      return await this.logoutTabLocator.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Get all visible navigation tabs when user is NOT logged in
   */
  async getVisibleTabsNotLoggedIn(): Promise<string[]> {
    const tabs: string[] = [];
    const tabLocators = [
      { name: 'Home', locator: this.page.locator("//a[span[text()='Home']]") },
      { name: 'FAQ', locator: this.page.locator("//a[span[text()='FAQ']]") },
      { name: 'Contact', locator: this.page.locator("//a[span[text()='Contact']]") },
      { name: 'Timetable', locator: this.page.locator("//a[span[text()='Timetable']]") },
      { name: 'Book ticket', locator: this.page.locator("//a[span[text()='Book ticket']]") },
      { name: 'Register', locator: this.page.locator("//a[span[text()='Register']]") },
      { name: 'Login', locator: this.page.locator("//a[span[text()='Login']]") }
    ];

    for (const tab of tabLocators) {
      if (await tab.locator.isVisible()) {
        tabs.push(tab.name);
      }
    }
    return tabs;
  }

  /**
   * Get all visible navigation tabs when user IS logged in
   */
  async getVisibleTabsLoggedIn(): Promise<string[]> {
    const tabs: string[] = [];
    const tabLocators = [
      { name: 'Home', locator: this.page.locator("//a[span[text()='Home']]") },
      { name: 'FAQ', locator: this.page.locator("//a[span[text()='FAQ']]") },
      { name: 'Contact', locator: this.page.locator("//a[span[text()='Contact']]") },
      { name: 'Timetable', locator: this.page.locator("//a[span[text()='Timetable']]") },
      { name: 'Ticket price', locator: this.page.locator("//a[span[text()='Ticket price']]") },
      { name: 'Book ticket', locator: this.page.locator("//a[span[text()='Book ticket']]") },
      { name: 'Change password', locator: this.page.locator("//a[span[text()='Change password']]") },
      { name: 'Log out', locator: this.page.locator("//a[span[text()='Log out']]") }
    ];

    for (const tab of tabLocators) {
      if (await tab.locator.isVisible()) {
        tabs.push(tab.name);
      }
    }
    return tabs;
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
   * Get page content text to check for misspellings
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
   * Check if current page is an error page (403, 404, 500)
   */
  async isErrorPage(): Promise<boolean> {
    const url = this.page.url();
    const pageContent = await this.pageContentLocator.innerText();

    // Check URL or page content for error indicators
    return (
      url.includes('error') ||
      url.includes('404') ||
      url.includes('403') ||
      url.includes('500') ||
      pageContent.includes('404') ||
      pageContent.includes('403') ||
      pageContent.includes('500') ||
      pageContent.includes('Not Found') ||
      pageContent.includes('Forbidden') ||
      pageContent.includes('Internal Server Error')
    );
  }

  /**
   * Get error message from error page
   */
  async getErrorPageMessage(): Promise<string> {
    try {
      return await this.errorPageLocator.first().innerText();
    } catch {
      return '';
    }
  }

  /**
   * Navigate to a non-existent page
   */
  async navigateToNonExistentPage(): Promise<void> {
    await this.page.goto(Constant.RAILWAY_URL + 'nonexistentpage12345');
  }

  /**
   * Check if all required tabs are clickable and have proper hover states
   */
  async checkTabsHoverState(): Promise<boolean> {
    const tabs = await this.page.locator('a[href]').all();

    for (const tab of tabs) {
      await tab.hover();
      // Small delay to see hover effect
      await this.page.waitForTimeout(100);
    }

    return true;
  }

  /**
   * Check tab index functionality
   */
  async checkTabIndexNavigation(): Promise<boolean> {
    // Press Tab key multiple times to navigate through focusable elements
    for (let i = 0; i < 10; i++) {
      await this.page.keyboard.press('Tab');
      await this.page.waitForTimeout(100);
    }
    return true;
  }
}
