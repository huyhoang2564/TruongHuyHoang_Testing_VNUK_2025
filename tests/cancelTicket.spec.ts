import { test, expect } from '@playwright/test';

import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import { BookTicketPage } from '../pages/BookTicketPage';
import { MyTicketPage } from '../pages/MyTicketPage';

import type { User } from '../models/User';
import type { Ticket } from '../models/Ticket';

import { Station } from '../types/Station';
import { SeatType } from '../types/SeatType';

function plusDaysDateOnly(days: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d;
}

test.describe('CancelTicketTest', () => {
  let loginPage: LoginPage;
  let homePage: HomePage;
  let bookTicketPage: BookTicketPage;
  let myTicketPage: MyTicketPage;

  let user: User;
  let ticket: Ticket;
  let id: number;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    homePage = new HomePage(page);
    bookTicketPage = new BookTicketPage(page);
    myTicketPage = new MyTicketPage(page);

    user = { email: 'test@agest.vn', password: '123456789' };

    ticket = {
      departDate: plusDaysDateOnly(5),
      departFrom: Station.SAI_GON,
      arriveAt: Station.NHA_TRANG,
      seatType: SeatType.SOFT_SEAT,
      amount: 1
    };

    await homePage.open();
    await homePage.goToLoginPage();
    await loginPage.login(user);
    await homePage.goToBookTicketPage();
    await bookTicketPage.bookTicket(ticket);

    id = await bookTicketPage.getTicketID();
  });

  test('testCancelTicket', async () => {
    await bookTicketPage.goToMyTicketPage();

    await myTicketPage.cancelTicketByID(id);

    expect(await myTicketPage.isCancelTicketButtonDisplayed(id)).toBeFalsy();
  });
});
