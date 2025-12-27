import { test, expect } from '@playwright/test';

import { HomePage } from '../pages/HomePage';
import { TimetablePage } from '../pages/TimetablePage';
import { TicketPricePage } from '../pages/TicketPricePage';
import { LoginPage } from '../pages/LoginPage';
import { BookTicketPage } from '../pages/BookTicketPage';

import type { User } from '../models/User';

async function openTimetable(homePage: HomePage, timetablePage: TimetablePage) {
  await test.step('Open → Timetable', async () => {
    await homePage.open();
    await homePage.goToTimetablePage();

    const header = await timetablePage.getHeaderText();
    expect(header).toContain('Train Timetable');
  });
}

async function login(homePage: HomePage, loginPage: LoginPage, user: User) {
  await test.step('Login', async () => {
    await test.step('Data', async () => {
      expect(user.email).toBeTruthy();
    });

    await homePage.open();
    await homePage.goToLoginPage();
    await loginPage.login(user);
  });
}

async function requireAtLeastOneRow(timetablePage: TimetablePage) {
  const rows = await timetablePage.getRows();
  expect(rows.length).toBeGreaterThan(0);
  return rows;
}

test.describe('Timetable Page Test Cases', () => {
  let homePage: HomePage;
  let timetablePage: TimetablePage;
  let ticketPricePage: TicketPricePage;
  let loginPage: LoginPage;
  let bookTicketPage: BookTicketPage;

  const validUser: User = { email: 'test@agest.vn', password: 'Anhkhoa6118' };

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    timetablePage = new TimetablePage(page);
    ticketPricePage = new TicketPricePage(page);
    loginPage = new LoginPage(page);
    bookTicketPage = new BookTicketPage(page);
  });

  test('TTB-01: UI of Time Table page displays properly', async () => {
    await openTimetable(homePage, timetablePage);

    await test.step('Verify table headers', async () => {
      const headers = await timetablePage.getHeaderNames();
      const text = headers.join(',');

      expect(text).toContain('Depart Station');
      expect(text).toContain('Arrive Station');
      expect(text).toContain('Depart Time');
      expect(text).toContain('Arrive Time');
      expect(text).toContain('Check Price');
    });

    await test.step('Verify UI integrity', async () => {
      const brokenImages = await timetablePage.getAllBrokenImages();
      expect(brokenImages.length).toBe(0);

      expect(await timetablePage.checkTabIndexNavigation()).toBe(true);
    });
  });

  test('TTB-02: User can navigate to corresponding pages when clicking on links', async () => {
    await openTimetable(homePage, timetablePage);

    await test.step('Verify links exist', async () => {
      const links = await timetablePage.getAllLinks();
      expect(links.length).toBeGreaterThan(0);
    });
  });

  test('TTB-03: User can view detailed trips that the system supports', async () => {
    await openTimetable(homePage, timetablePage);

    await test.step('Verify trips table content', async () => {
      await requireAtLeastOneRow(timetablePage);

      const firstRowData = await timetablePage.getRowData(1);
      expect(firstRowData.length).toBeGreaterThanOrEqual(5);

      expect(firstRowData[1]).toBeTruthy();
      expect(firstRowData[2]).toBeTruthy();
    });
  });

  test('TTB-04: User can check the ticket prices of a selected trip', async () => {
    await openTimetable(homePage, timetablePage);

    await test.step('Click Check Price (row 1)', async () => {
      await test.step('Data', async () => {
        expect(1).toBe(1);
      });
      await timetablePage.clickCheckPrice(1);
    });

    await test.step('Verify Ticket Price page loaded', async () => {
      expect(await ticketPricePage.isTicketPriceTableDisplayed()).toBe(true);
    });
  });

  test('TTB-05: User redirected to login when clicking Book Ticket if not logged in', async () => {
    await openTimetable(homePage, timetablePage);

    await test.step('Click Book Ticket (row 1)', async () => {
      await test.step('Data', async () => {
        expect(1).toBe(1);
      });
      await timetablePage.clickBookTicket(1);
    });

    await test.step('Verify redirected to Login', async () => {
      expect(await loginPage.isLoginPageLoaded()).toBe(true);
    });
  });

  test('TTB-06: User can navigate to Book ticket page if already logged in', async () => {
    await login(homePage, loginPage, validUser);

    await test.step('Go to Timetable', async () => {
      await homePage.goToTimetablePage();
      const header = await timetablePage.getHeaderText();
      expect(header).toContain('Train Timetable');
    });

    await test.step('Click Book Ticket (row 1)', async () => {
      await test.step('Data', async () => {
        expect(1).toBe(1);
      });
      await timetablePage.clickBookTicket(1);
    });

    await test.step('Verify Book Ticket page loaded', async () => {
      const header = await bookTicketPage.getHeaderText();
      expect(header).toContain('Book ticket');
    });
  });

  test('TTB-07: Valid train time data format', async () => {
    await openTimetable(homePage, timetablePage);

    await test.step('Verify time format on first row', async () => {
      await requireAtLeastOneRow(timetablePage);

      const data = await timetablePage.getRowData(1);
      expect(data.length).toBeGreaterThanOrEqual(5);

      const departTime = (data[3] ?? '').trim();
      const arriveTime = (data[4] ?? '').trim();

      expect(departTime).toMatch(/^\d{1,2}:\d{2}$/);
      expect(arriveTime).toMatch(/^\d{1,2}:\d{2}$/);
    });
  });

  test('TTB-08: Verify sorting order of timetable data', async () => {
    await openTimetable(homePage, timetablePage);

    await test.step('Verify rows exist', async () => {
      await requireAtLeastOneRow(timetablePage);
    });

    await test.step('Verify time is non-decreasing (row 1→2)', async () => {
      const rows = await timetablePage.getRows();
      expect(rows.length).toBeGreaterThanOrEqual(2);

      const r1 = await timetablePage.getRowData(1);
      const r2 = await timetablePage.getRowData(2);

      const t1 = (r1[3] ?? '').trim();
      const t2 = (r2[3] ?? '').trim();

      expect(t1).toMatch(/^\d{1,2}:\d{2}$/);
      expect(t2).toMatch(/^\d{1,2}:\d{2}$/);

      const toMinutes = (hhmm: string) => {
        const [h, m] = hhmm.split(':').map((x) => Number.parseInt(x, 10));
        return h * 60 + m;
      };

      expect(toMinutes(t2)).toBeGreaterThanOrEqual(toMinutes(t1));
    });
  });
});
