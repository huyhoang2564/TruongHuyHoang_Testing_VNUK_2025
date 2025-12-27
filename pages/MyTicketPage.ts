import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class MyTicketPage extends BasePage {
  private readonly table: Locator;
  private readonly headerCells: Locator;
  private readonly bodyRows: Locator;

  private readonly applyFilterButton: Locator;
  private readonly filterDepartStation: Locator;
  private readonly filterArriveStation: Locator;
  private readonly filterDepartDate: Locator;
  private readonly filterStatus: Locator;

  constructor(page: Page) {
    super(page);

    this.table = page.locator('table.MyTable');
    this.headerCells = this.table.locator('thead th');
    this.bodyRows = this.table.locator('tbody tr');

    this.applyFilterButton = page.locator('input[value="Apply Filter"]');

    this.filterDepartStation = page.locator('select[name="FilterDpStation"]');
    this.filterArriveStation = page.locator('select[name="FilterArStation"]');
    this.filterDepartDate = page.locator('input[name="FilterDpDate"]');
    this.filterStatus = page.locator('select[name="FilterStatus"]');
  }

  async getHeaderNames(): Promise<string[]> {
    await expect(this.table).toBeVisible();
    return await this.headerCells.allInnerTexts();
  }

  async getRows(): Promise<Locator[]> {
    await expect(this.table).toBeVisible();
    return await this.bodyRows.all();
  }

  async getRowData(rowIndex: number): Promise<string[]> {
    await expect(this.table).toBeVisible();
    const row = this.bodyRows.nth(rowIndex - 1);
    await expect(row).toBeVisible();
    return await row.locator('td').allInnerTexts();
  }

  async isFilterVisible(): Promise<boolean> {
    return await this.applyFilterButton.isVisible().catch(() => false);
  }

  async filterByDepartStation(stationLabel: string): Promise<void> {
    await expect(this.filterDepartStation).toBeVisible();
    await this.filterDepartStation.selectOption({ label: stationLabel });
  }

  async filterByArriveStation(stationLabel: string): Promise<void> {
    await expect(this.filterArriveStation).toBeVisible();
    await this.filterArriveStation.selectOption({ label: stationLabel });
  }

  async filterByDepartDate(value: string): Promise<void> {
    await expect(this.filterDepartDate).toBeVisible();
    await this.filterDepartDate.fill(value);
  }

  async filterByStatus(statusLabel: string): Promise<void> {
    await expect(this.filterStatus).toBeVisible();
    await this.filterStatus.selectOption({ label: statusLabel });
  }

  async clickApplyFilter(): Promise<void> {
    await expect(this.applyFilterButton).toBeVisible();
    await this.applyFilterButton.click();
    await expect(this.table).toBeVisible();
  }

  private async acceptNextDialog(): Promise<void> {
    this.page.once('dialog', (d) => d.accept());
  }

  async cancelFirstTicket(): Promise<void> {
    await expect(this.table).toBeVisible();

    const cancelBtn = this.page.locator("input[value='Cancel']").first();
    await expect(cancelBtn).toBeVisible();

    const beforeCount = await this.bodyRows.count();

    await this.acceptNextDialog();
    await cancelBtn.click();

    await expect
      .poll(async () => await this.bodyRows.count(), { timeout: 10_000 })
      .not.toBe(beforeCount);
  }

  async deleteFirstExpiredTicket(): Promise<void> {
    await expect(this.table).toBeVisible();

    const expiredRow = this.bodyRows.filter({ hasText: 'Expired' }).first();
    await expect(expiredRow).toBeVisible();

    const deleteBtn = expiredRow.locator("input[value='Delete']");
    await expect(deleteBtn).toBeVisible();

    const beforeCount = await this.bodyRows.count();

    await this.acceptNextDialog();
    await deleteBtn.click();

    await expect
      .poll(async () => await this.bodyRows.count(), { timeout: 10_000 })
      .not.toBe(beforeCount);
  }

  async cancelTicketByID(id: number): Promise<void> {
    const cancelButton = this.page.locator(
      `//input[@value='Cancel' and contains(@onclick, 'DeleteTicket(${id})')]`
    );
    await expect(cancelButton).toBeVisible();

    await this.acceptNextDialog();
    await cancelButton.click();
  }

  async isCancelTicketButtonDisplayed(id: number): Promise<boolean> {
    const cancelButton = this.page.locator(
      `//input[@value='Cancel' and contains(@onclick, 'DeleteTicket(${id})')]`
    );
    return await cancelButton.isVisible().catch(() => false);
  }
}
