import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class TimetablePage extends BasePage {
  private readonly rowsLocator: Locator;

  constructor(page: Page) {
    super(page);
    // Assuming a standard table structure. Adjust selector if better one known or found.
    // Usually 'table.MyTable tr' or similar. 
    // Using generic 'table tr' but excluding header if possible, or handling it in methods.
    this.rowsLocator = page.locator('table.MyTable tr:has(td)');
  }

  async getRows(): Promise<Locator[]> {
    return await this.rowsLocator.all();
  }

  /**
   * Click "Check Price" for a specific row index (1-based index relative to data rows)
   */
  async clickCheckPrice(rowIndex: number): Promise<void> {
    // Assuming "Check Price" is a link/button in the row.
    const row = this.rowsLocator.nth(rowIndex - 1);
    // Assuming the text is "Check Price".
    await row.locator('a', { hasText: 'Check Price' }).click();
  }

  /**
 * Click "Book ticket" for a specific row index (1-based index relative to data rows)
 */
  async clickBookTicket(rowIndex: number): Promise<void> {
    const row = this.rowsLocator.nth(rowIndex - 1);
    // Assuming the text is "Book ticket".
    await row.locator('a', { hasText: 'Book ticket' }).click();
  }

  /**
   * Get row data as text array to verify sorting/content
   */
  async getRowData(rowIndex: number): Promise<string[]> {
    const row = this.rowsLocator.nth(rowIndex - 1);
    return await row.locator('td').allInnerTexts();
  }

  async getHeaderNames(): Promise<string[]> {
    return await this.page.locator('table.MyTable tr th').allInnerTexts();
  }
}
