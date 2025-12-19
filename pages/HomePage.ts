// pages/HomePage.ts
import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { Constant } from '../constants/Constant';

export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // public void open()
  async open(): Promise<void> {
    await this.page.goto(Constant.RAILWAY_URL);
  }

  // public boolean isLogoutTabVisible()
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
}
