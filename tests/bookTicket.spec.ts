import { test, expect } from '@playwright/test';

import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { BookTicketPage } from '../pages/BookTicketPage';

import type { User } from '../models/User';
import type { Ticket } from '../models/Ticket';

import { Station } from '../types/Station';
import { SeatType } from '../types/SeatType';

/**
 * Java: LocalDate.now().plusDays(5)
 * TS: tạo Date chỉ có ngày (00:00:00) để so sánh chính xác
 */
function plusDaysDateOnly(days: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d;
}

test.describe('BookTicketTest', () => {
  let homePage: HomePage;
  let loginPage: LoginPage;
  let bookTicketPage: BookTicketPage;

  let user: User;
  let ticket: Ticket;

  // === @BeforeMethod ===
  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    loginPage = new LoginPage(page);
    bookTicketPage = new BookTicketPage(page);

    user = {
      email: 'test@agest.vn',
      password: '123456789'
    };

    ticket = {
      departDate: plusDaysDateOnly(5),
      departFrom: Station.SAI_GON,
      arriveAt: Station.NHA_TRANG,
      seatType: SeatType.SOFT_SEAT,
      amount: 1
    };
  });

  // === @Test ===
  test('test', async () => {
    await homePage.open();

    await homePage.goToLoginPage();
    await loginPage.login(user);

    await homePage.goToBookTicketPage();
    await bookTicketPage.bookTicket(ticket);

    // Assert header
    expect(await bookTicketPage.getHeaderText()).toBe(
      'Ticket Booked Successfully!'
    );

    // Assert booked ticket equals input ticket
    const bookedTicket = await bookTicketPage.getBookedTicket();
    expect(bookedTicket).toEqual(ticket);
  });
});
