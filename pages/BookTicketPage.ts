// pages/BookTicketPage.ts
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import type { Ticket } from '../models/Ticket';
import { Constant } from '../constants/Constant';
import { DriverUtils } from '../utils/DriverUtils';
import { Station } from '../types/Station';
import { SeatType } from '../types/SeatType';

export class BookTicketPage extends BasePage {
  private readonly departDateSelectLocator: Locator;
  private readonly departFromSelectLocator: Locator;
  private readonly arriveAtSelectLocator: Locator;
  private readonly seatTypeSelectLocator: Locator;
  private readonly amountSelectLocator: Locator;
  private readonly bookTicketButtonLocator: Locator;

  constructor(page: Page) {
    super(page);

    this.departDateSelectLocator = page.locator('[name="Date"]');
    this.departFromSelectLocator = page.locator('[name="DepartStation"]');
    this.arriveAtSelectLocator = page.locator('[name="ArriveStation"]');
    this.seatTypeSelectLocator = page.locator('[name="SeatType"]');
    this.amountSelectLocator = page.locator('[name="TicketAmount"]');
    this.bookTicketButtonLocator = page.locator('input[type=submit]');
  }

  async bookTicket(ticket: Ticket): Promise<void> {
    await this.selectDepartDate(ticket.departDate);
    await this.selectDepartFrom(ticket.departFrom);
    await this.selectArriveAt(ticket.arriveAt);
    await this.selectSeatType(ticket.seatType);
    await this.selectAmount(ticket.amount);

    await DriverUtils.scrollIntoView(this.bookTicketButtonLocator);
    await this.clickBookTicketButton();
  }

  async getBookedTicket(): Promise<Ticket> {
    return {
      departDate: await this.getDepartDate(),
      departFrom: await this.getDepartStation(),
      arriveAt: await this.getArriveStation(),
      seatType: await this.getSeatType(),
      amount: await this.getAmount()
    };
  }

  async getTicketID(): Promise<number> {
    const url = this.page.url();
    const u = new URL(url);
    const id = u.searchParams.get('id');
    if (!id) throw new Error(`Cannot find ticket id in url: ${url}`);
    return Number.parseInt(id, 10);
  }

  // ===== Read booked ticket table =====

  private async getDepartStation(): Promise<Station> {
    const text = await this.getColumnText('Depart Station');
    const station = Station.fromText(text);
    if (!station) throw new Error(`Unknown Depart Station text: "${text}"`);
    return station;
  }

  private async getArriveStation(): Promise<Station> {
    const text = await this.getColumnText('Arrive Station');
    const station = Station.fromText(text);
    if (!station) throw new Error(`Unknown Arrive Station text: "${text}"`);
    return station;
  }

  private async getDepartDate(): Promise<Date> {
    const text = await this.getColumnText('Depart Date');
    // Bạn implement Constant.parseDate/formatDate theo formatter Java của bạn
    return Constant.parseDate(text);
  }

  private async getSeatType(): Promise<SeatType> {
    const text = await this.getColumnText('Seat Type');
    const type = SeatType.fromText(text);
    if (!type) throw new Error(`Unknown Seat Type text: "${text}"`);
    return type;
  }

  private async getAmount(): Promise<number> {
    const text = await this.getColumnText('Amount');
    return Number.parseInt(text, 10);
  }

  private async getColumnText(columnName: string): Promise<string> {
    const index = await this.getColumnIndex(columnName);
    const cell = this.page.locator(`//tr/td[${index}]`).first();
    return (await cell.innerText()).trim();
  }

  private async getColumnIndex(column: string): Promise<number> {
    const preceding = this.page.locator(
      `//tr/th[text()='${column}']/preceding-sibling::th`
    );
    return (await preceding.count()) + 1;
  }

  // ===== Select dropdowns =====

  private async selectDepartDate(date: Date): Promise<void> {
    const label = Constant.formatDate(date);
    await this.departDateSelectLocator.selectOption({ label });
  }

  private async selectDepartFrom(station: Station): Promise<void> {
    const selectedText = await this.departFromSelectLocator
      .locator('option:checked')
      .innerText()
      .catch(() => '');

    // ✅ Station.getText(station) (không phải station.getText())
    if (selectedText.trim() === Station.getText(station)) return;

    // chụp danh sách option trước khi đổi
    const before = await this.arriveAtSelectLocator
      .locator('option')
      .allTextContents()
      .catch(() => []);

    await this.departFromSelectLocator.selectOption({ label: Station.getText(station) });

    // đợi dropdown ArriveStation đổi option (tương đương stalenessOf trong Selenium)
    await expect
      .poll(
        async () =>
          (await this.arriveAtSelectLocator.locator('option').allTextContents()).join('|'),
        { timeout: 10_000 }
      )
      .not.toBe(before.join('|'));
  }

  private async selectArriveAt(station: Station): Promise<void> {
    await this.arriveAtSelectLocator.selectOption({ label: Station.getText(station) });
  }

  private async selectSeatType(type: SeatType): Promise<void> {
    // ✅ SeatType.getText(type) (không phải type.getText())
    await this.seatTypeSelectLocator.selectOption({ label: SeatType.getText(type) });
  }

  private async selectAmount(amount: number): Promise<void> {
    await this.amountSelectLocator.selectOption({ label: String(amount) });
  }

  private async clickBookTicketButton(): Promise<void> {
    await this.bookTicketButtonLocator.click();
  }
}
