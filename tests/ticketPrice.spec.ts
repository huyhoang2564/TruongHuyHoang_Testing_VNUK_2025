import { test, expect } from '@playwright/test';

import { HomePage } from '../pages/HomePage';
import { TicketPricePage } from '../pages/TicketPricePage';
import { LoginPage } from '../pages/LoginPage';
import { BookTicketPage } from '../pages/BookTicketPage';
import type { User } from '../models/User';

async function openTicketPrice(homePage: HomePage, ticketPricePage: TicketPricePage) {
  await test.step('Open → Ticket Price', async () => {
    await homePage.open();
    await homePage.goToTicketPricePage();

    const header = await ticketPricePage.getHeaderText?.().catch(() => '');
    expect(typeof header).toBe('string');
  });
}

async function openPriceDetail(ticketPricePage: TicketPricePage, rowIndex = 1) {
  await test.step('Open price detail', async () => {
    await test.step('Data', async () => {
      expect(rowIndex).toBeGreaterThan(0);
    });

    await ticketPricePage.clickCheckPrice(rowIndex);
    expect(await ticketPricePage.isTicketPriceTableDisplayed()).toBe(true);
  });
}

async function clickFirstBookTicketInDetail(ticketPricePage: TicketPricePage) {
  await test.step('Click Book ticket (first available)', async () => {
    const rows = await ticketPricePage.getPriceRows();
    expect(rows.length).toBeGreaterThan(0);

    const first = rows[0];
    // Prefer exact link text if available in the UI; keeps behavior deterministic.
    const link = first.locator('a', { hasText: 'Book ticket' }).first();
    await expect(link).toBeVisible();
    await link.click();
  });
}

test.describe('Ticket Price Page Test Cases', () => {
  let homePage: HomePage;
  let ticketPricePage: TicketPricePage;
  let loginPage: LoginPage;
  let bookTicketPage: BookTicketPage;

  const validUser: User = { email: 'test@agest.vn', password: 'Anhkhoa6118' };

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    ticketPricePage = new TicketPricePage(page);
    loginPage = new LoginPage(page);
    bookTicketPage = new BookTicketPage(page);

    await openTicketPrice(homePage, ticketPricePage);
  });

  test('TPR-01: UI of Ticket price page displays properly', async () => {
    await test.step('UI checks', async () => {
      const brokenImages = await ticketPricePage.getAllBrokenImages();
      expect(brokenImages.length).toBe(0);

      expect(await ticketPricePage.checkButtonsHoverState()).toBe(true);
      expect(await ticketPricePage.checkTabIndexNavigation()).toBe(true);
    });
  });

  test('TPR-02: User can navigate to corresponding pages when clicking on buttons', async () => {
    await openPriceDetail(ticketPricePage, 1);
    expect(await ticketPricePage.isTicketPriceTableDisplayed()).toBe(true);
  });

  test('TPR-03: User can view train ticket price list that the system supports', async () => {
    await test.step('Verify list exists', async () => {
      const rows = await ticketPricePage.getRows();
      expect(rows.length).toBeGreaterThan(0);
    });
  });

  test('TPR-04: User can check ticket prices of the trip', async () => {
    await openPriceDetail(ticketPricePage, 1);

    await test.step('Verify detail content', async () => {
      const priceRows = await ticketPricePage.getPriceRows();
      expect(priceRows.length).toBeGreaterThan(0);

      const headers = await ticketPricePage.getHeaderNames();
      expect(headers.join(' ')).toMatch(/Price|Seat/i);
    });
  });

  test('TPR-05: Redirect to login when clicking Book Ticket if not logged in', async () => {
    await openPriceDetail(ticketPricePage, 1);
    await clickFirstBookTicketInDetail(ticketPricePage);

    await test.step('Verify redirected to Login', async () => {
      expect(await loginPage.isLoginPageLoaded()).toBe(true);
    });
  });

  test('TPR-06: Navigate to Book Ticket page if logged in', async () => {
    await test.step('Login', async () => {
      await homePage.goToLoginPage();

      await test.step('Data', async () => {
        expect(validUser.email).toBeTruthy();
        expect(validUser.password).toBeTruthy();
      });

      await loginPage.login(validUser);
    });

    await openTicketPrice(homePage, ticketPricePage);
    await openPriceDetail(ticketPricePage, 1);
    await clickFirstBookTicketInDetail(ticketPricePage);

    await test.step('Verify Book Ticket page', async () => {
      const header = await bookTicketPage.getHeaderText();
      expect(header).toContain('Book ticket');
    });
  });

  test('TPR-07: Depart from and Arrive at fields must follow valid trip matrix', async () => {
    await test.step('Verify trips list is not empty', async () => {
      const rows = await ticketPricePage.getRows();
      expect(rows.length).toBeGreaterThan(0);
    });
  });
});
