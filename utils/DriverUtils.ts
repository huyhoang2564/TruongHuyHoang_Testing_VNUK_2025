// utils/DriverUtils.ts
import type { Locator } from '@playwright/test';

export class DriverUtils {
  // public static void scrollIntoView(WebElement element)
  static async scrollIntoView(element: Locator): Promise<void> {
    // Playwright tương đương executeScript("arguments[0].scrollIntoView()")
    await element.evaluate((el) => {
      el.scrollIntoView();
    });
  }
}
