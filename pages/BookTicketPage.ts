import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import type { Ticket } from '../models/Ticket';
import { Constant } from '../constants/Constant';
import { DriverUtils } from '../utils/DriverUtils';
import { Station } from '../types/Station';
import { SeatType } from '../types/SeatType';

export class BookTicketPage extends BasePage {
  private readonly departDateSelect: Locator;
  private readonly departFromSelect: Locator;
  private readonly arriveAtSelect: Locator;
  private readonly seatTypeSelect: Locator;
  private readonly amountSelect: Locator;
  private readonly submitButton: Locator;

  private readonly totalPrice: Locator;

  constructor(page: Page) {
    super(page);

    this.departDateSelect = page.locator('[name="Date"]');
    this.departFromSelect = page.locator('[name="DepartStation"]');
    this.arriveAtSelect = page.locator('[name="ArriveStation"]');
    this.seatTypeSelect = page.locator('[name="SeatType"]');
    this.amountSelect = page.locator('[name="TicketAmount"]');
    this.submitButton = page.locator('input[type=submit]');

    this.totalPrice = page.locator(
      '#totalPrice, .total-price, .totalPrice, [data-testid="total-price"], text=/Total\\s*Price/i'
    ).first();
  }

  async bookTicket(ticket: Ticket): Promise<void> {
    await this.selectDepartDate(ticket.departDate);
    await this.selectDepartFrom(ticket.departFrom);
    await this.selectArriveAt(ticket.arriveAt);
    await this.selectSeatType(ticket.seatType);
    await this.selectAmount(ticket.amount);

    await DriverUtils.scrollIntoView(this.submitButton);
    await this.clickBookTicketButton();
  }

  async getBookedTicket(): Promise<Ticket> {
    return {
      departDate: await this.getDepartDateFromResult(),
      departFrom: await this.getDepartStationFromResult(),
      arriveAt: await this.getArriveStationFromResult(),
      seatType: await this.getSeatTypeFromResult(),
      amount: await this.getAmountFromResult(),
    };
  }

  async getTicketID(): Promise<number> {
    const url = this.page.url();
    const u = new URL(url);
    const id = u.searchParams.get('id');
    expect(id).toBeTruthy();
    return Number.parseInt(id!, 10);
  }

  async selectDepartDate(date: Date): Promise<void> {
    const label = Constant.formatDate(date);

    await expect(this.departDateSelect).toBeVisible();
    await this.expectOptionsLoaded(this.departDateSelect);

    const optionLabels = (await this.departDateSelect.locator('option').allTextContents()).map((s) => s.trim());
    expect(optionLabels).toContain(label);

    await this.departDateSelect.selectOption({ label });
  }

  async selectDepartFrom(station: Station): Promise<void> {
    await expect(this.departFromSelect).toBeVisible();
    await this.expectOptionsLoaded(this.departFromSelect);

    const targetLabel = Station.getText(station);

    const selectedText = await this.departFromSelect
      .locator('option:checked')
      .innerText()
      .catch(() => '');
    if (selectedText.trim() === targetLabel) return;

    const before = await this.arriveAtSelect.locator('option').allTextContents().catch(() => []);
    await this.departFromSelect.selectOption({ label: targetLabel });

    await expect
      .poll(async () => (await this.arriveAtSelect.locator('option').allTextContents()).join('|'), { timeout: 10_000 })
      .not.toBe(before.join('|'));
  }

  async selectArriveAt(station: Station): Promise<void> {
    await expect(this.arriveAtSelect).toBeVisible();
    await this.expectOptionsLoaded(this.arriveAtSelect);
    await this.arriveAtSelect.selectOption({ label: Station.getText(station) });
  }

  async selectSeatType(type: SeatType): Promise<void> {
    await expect(this.seatTypeSelect).toBeVisible();
    await this.expectOptionsLoaded(this.seatTypeSelect);
    await this.seatTypeSelect.selectOption({ label: SeatType.getText(type) });
  }

  async selectAmount(amount: number): Promise<void> {
    await expect(this.amountSelect).toBeVisible();
    await this.expectOptionsLoaded(this.amountSelect);
    await this.amountSelect.selectOption({ label: String(amount) });
  }

  async clickBookTicketButton(): Promise<void> {
    await expect(this.submitButton).toBeVisible();
    await this.submitButton.click();
  }

  async getDepartDateOptions(): Promise<string[]> {
    await expect(this.departDateSelect).toBeVisible();
    await this.expectOptionsLoaded(this.departDateSelect);
    return await this.departDateSelect.locator('option').allInnerTexts();
  }

  async getSeatTypeOptions(): Promise<string[]> {
    await expect(this.seatTypeSelect).toBeVisible();
    await this.expectOptionsLoaded(this.seatTypeSelect);
    return await this.seatTypeSelect.locator('option').allInnerTexts();
  }

  async getAmountOptions(): Promise<string[]> {
    await expect(this.amountSelect).toBeVisible();
    await this.expectOptionsLoaded(this.amountSelect);
    return await this.amountSelect.locator('option').allInnerTexts();
  }

  async getTotalPriceText(): Promise<string> {
    await expect(this.totalPrice).toBeVisible();
    return (await this.totalPrice.innerText()).trim();
  }

  async getTotalPriceValue(): Promise<number> {
    const text = await this.getTotalPriceText();
    const digits = text.replace(/[^\d]/g, '');
    expect(digits).toBeTruthy();
    return Number.parseInt(digits, 10);
  }

  private async expectOptionsLoaded(select: Locator): Promise<void> {
    await expect
      .poll(async () => await select.locator('option').count(), { timeout: 10_000 })
      .toBeGreaterThan(0);
  }

  private async getDepartStationFromResult(): Promise<Station> {
    const text = await this.getResultCellText('Depart Station');
    const station = Station.fromText(text);
    expect(station).toBeTruthy();
    return station!;
  }

  private async getArriveStationFromResult(): Promise<Station> {
    const text = await this.getResultCellText('Arrive Station');
    const station = Station.fromText(text);
    expect(station).toBeTruthy();
    return station!;
  }

  private async getDepartDateFromResult(): Promise<Date> {
    const text = await this.getResultCellText('Depart Date');
    return Constant.parseDate(text);
  }

  private async getSeatTypeFromResult(): Promise<SeatType> {
    const text = await this.getResultCellText('Seat Type');
    const type = SeatType.fromText(text);
    expect(type).toBeTruthy();
    return type!;
  }

  private async getAmountFromResult(): Promise<number> {
    const text = await this.getResultCellText('Amount');
    const n = Number.parseInt(text, 10);
    expect(Number.isFinite(n)).toBe(true);
    return n;
  }

  private async getResultCellText(columnName: string): Promise<string> {
    const index = await this.getColumnIndex(columnName);
    const cell = this.page.locator(`//tr/td[${index}]`).first();
    await expect(cell).toBeVisible();
    return (await cell.innerText()).trim();
  }

  private async getColumnIndex(column: string): Promise<number> {
    const preceding = this.page.locator(`//tr/th[text()='${column}']/preceding-sibling::th`);
    const idx = (await preceding.count()) + 1;
    expect(idx).toBeGreaterThan(0);
    return idx;
  }
}
