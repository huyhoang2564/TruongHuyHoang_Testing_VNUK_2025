import { test, expect } from '@playwright/test';

import { HomePage } from '../pages/HomePage';
import { BookTicketPage } from '../pages/BookTicketPage';
import { LoginPage } from '../pages/LoginPage';
import { MyTicketPage } from '../pages/MyTicketPage';

import type { User } from '../models/User';
import { Station } from '../types/Station';
import { SeatType } from '../types/SeatType';
import { Constant } from '../constants/Constant';

type BookingData = {
  departOffsetDays: number;
  departFrom: Station;
  arriveAt: Station;
  seatType: SeatType;
  amount: number;
};

async function login(homePage: HomePage, loginPage: LoginPage, user: User) {
  await test.step('Login', async () => {
    await test.step('Data', async () => {
      expect(user.email).toBeTruthy();
      expect(user.password).toBeTruthy();
    });

    await homePage.open();
    await homePage.goToLoginPage();
    await loginPage.login(user);
  });
}

async function gotoBookTicket(homePage: HomePage, bookTicketPage: BookTicketPage) {
  await test.step('Go to Book Ticket', async () => {
    await homePage.goToBookTicketPage();
    const header = await bookTicketPage.getHeaderText();
    expect(header).toBeTruthy();
  });
}

async function fillBooking(bookTicketPage: BookTicketPage, data: BookingData) {
  await test.step('Fill booking form', async () => {
    await test.step('Data', async () => {
      expect(data.departOffsetDays).toBeGreaterThan(0);
      expect(data.amount).toBeGreaterThan(0);
    });

    const departDate = Constant.addDays(new Date(), data.departOffsetDays);
    await bookTicketPage.selectDepartDate(departDate);
    await bookTicketPage.selectDepartFrom(data.departFrom);
    await bookTicketPage.selectArriveAt(data.arriveAt);
    await bookTicketPage.selectSeatType(data.seatType);
    await bookTicketPage.selectAmount(data.amount);
  });
}

async function submitBooking(bookTicketPage: BookTicketPage) {
  await test.step('Submit booking', async () => {
    await bookTicketPage.clickBookTicketButton();
  });
}

test.describe('Book Ticket Page Test Cases', () => {
  let homePage: HomePage;
  let bookTicketPage: BookTicketPage;
  let loginPage: LoginPage;
  let myTicketPage: MyTicketPage;

  const validUser: User = { email: 'test@agest.vn', password: 'Anhkhoa6118' };

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    bookTicketPage = new BookTicketPage(page);
    loginPage = new LoginPage(page);
    myTicketPage = new MyTicketPage(page);
  });

  test('BKT-01: UI of Book Ticket page displays properly', async () => {
    await login(homePage, loginPage, validUser);
    await gotoBookTicket(homePage, bookTicketPage);

    await test.step('UI checks', async () => {
      const brokenImages = await bookTicketPage.getAllBrokenImages();
      expect(brokenImages.length).toBe(0);

      expect(await bookTicketPage.checkButtonsHoverState()).toBe(true);
      expect(await bookTicketPage.checkTabIndexNavigation()).toBe(true);
    });
  });

  test('BKT-02: Redirect to Login page when clicking Book ticket if not logged in', async () => {
    await test.step('Open → Book Ticket (unauthenticated)', async () => {
      await homePage.open();
      await homePage.goToBookTicketPage();
    });

    await test.step('Verify redirected to Login', async () => {
      expect(await loginPage.isLoginPageLoaded()).toBe(true);
    });
  });

  test('BKT-03: Depart date display 3 - 30 days ahead', async () => {
    await login(homePage, loginPage, validUser);
    await gotoBookTicket(homePage, bookTicketPage);

    await test.step('Verify date options range', async () => {
      const options = await bookTicketPage.getDepartDateOptions();
      expect(options.length).toBeGreaterThan(0);

      const today = new Date();
      const min = Constant.addDays(today, 3);
      const max = Constant.addDays(today, 30);

      // Convert option texts -> Date using Constant.parseDate (system format)
      // Only keep parseable values to avoid "Select date" placeholder.
      const parsed = options
        .map((t) => t.trim())
        .map((t) => {
          try {
            return Constant.parseDate(t);
          } catch {
            return null;
          }
        })
        .filter((d): d is Date => d !== null);

      expect(parsed.length).toBeGreaterThan(0);

      const minOption = new Date(Math.min(...parsed.map((d) => d.getTime())));
      const maxOption = new Date(Math.max(...parsed.map((d) => d.getTime())));

      expect(minOption.getTime()).toBeGreaterThanOrEqual(min.getTime());
      expect(maxOption.getTime()).toBeLessThanOrEqual(max.getTime());
    });
  });

  test('BKT-05: Seat type displays all supported types', async () => {
    await login(homePage, loginPage, validUser);
    await gotoBookTicket(homePage, bookTicketPage);

    await test.step('Verify seat types', async () => {
      const options = (await bookTicketPage.getSeatTypeOptions()).map((s) => s.trim());
      expect(options.length).toBeGreaterThan(0);

      expect(options).toContain('Soft seat');
      expect(options).toContain('Hard seat');
      expect(options.length).toBeGreaterThanOrEqual(5);
    });
  });

  test('BKT-06: User can book tickets successfully', async () => {
    await login(homePage, loginPage, validUser);
    await gotoBookTicket(homePage, bookTicketPage);

    const data: BookingData = {
      departOffsetDays: 4,
      departFrom: Station.DA_NANG,
      arriveAt: Station.SAI_GON,
      seatType: SeatType.SOFT_SEAT,
      amount: 1,
    };

    await fillBooking(bookTicketPage, data);
    await submitBooking(bookTicketPage);

    await test.step('Verify booking success page', async () => {
      const header = await bookTicketPage.getHeaderText();
      expect(header).toMatch(/Ticket Booked Successfully/i);
    });

    await test.step('Verify booked ticket appears in My Ticket', async () => {
      await homePage.goToMyTicketPage();

      const rows = await myTicketPage.getRows();
      expect(rows.length).toBeGreaterThan(0);

      const row1 = await myTicketPage.getRowData(1);
      const joined = row1.join(' ');

      expect(joined).toContain(Station.getText(data.departFrom));
      expect(joined).toContain(Station.getText(data.arriveAt));
      expect(joined).toMatch(/Soft seat/i);
    });
  });

  test('BKT-07: Ticket amount field displays values from 1-10', async () => {
    await login(homePage, loginPage, validUser);
    await gotoBookTicket(homePage, bookTicketPage);

    await test.step('Verify amount options', async () => {
      const amounts = (await bookTicketPage.getAmountOptions()).map((s) => s.trim());
      expect(amounts.length).toBe(10);
      expect(amounts[0]).toBe('1');
      expect(amounts[9]).toBe('10');
    });
  });

  test('BKT-08: User can book maximum 10 number of tickets', async () => {
    await login(homePage, loginPage, validUser);
    await gotoBookTicket(homePage, bookTicketPage);

    const data: BookingData = {
      departOffsetDays: 5,
      departFrom: Station.SAI_GON,
      arriveAt: Station.NHA_TRANG,
      seatType: SeatType.HARD_SEAT,
      amount: 10,
    };

    await fillBooking(bookTicketPage, data);
    await submitBooking(bookTicketPage);

    await test.step('Verify success', async () => {
      const header = await bookTicketPage.getHeaderText();
      expect(header).toMatch(/Ticket Booked Successfully/i);
    });
  });

  test('BKT-09: User cannot book more than 10 tickets', async () => {
    await login(homePage, loginPage, validUser);
    await gotoBookTicket(homePage, bookTicketPage);

    await test.step('Verify amount does not allow > 10', async () => {
      const amounts = (await bookTicketPage.getAmountOptions()).map((s) => s.trim());
      expect(amounts).not.toContain('11');
      expect(amounts).not.toContain('12');
    });
  });

  test('BKT-11: User can view total ticket price before confirming', async () => {
    await login(homePage, loginPage, validUser);
    await gotoBookTicket(homePage, bookTicketPage);

    const data: BookingData = {
      departOffsetDays: 4,
      departFrom: Station.DA_NANG,
      arriveAt: Station.SAI_GON,
      seatType: SeatType.SOFT_SEAT,
      amount: 2,
    };

    await fillBooking(bookTicketPage, data);

    await test.step('Verify total price displayed', async () => {
      const totalPrice = await bookTicketPage.getTotalPriceText();
      expect(totalPrice).toBeGreaterThan(0);
    });
  });
});
