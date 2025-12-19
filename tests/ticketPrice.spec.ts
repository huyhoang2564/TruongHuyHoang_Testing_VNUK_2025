import { test, expect } from '@playwright/test';

import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { TicketPricePage } from '../pages/TicketPricePage';

import type { User } from '../models/User';

test.describe('TicketPriceTest', () => {
  let homePage: HomePage;
  let loginPage: LoginPage;
  let ticketPricePage: TicketPricePage;
  let user: User;

  // === @BeforeMethod ===
  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    loginPage = new LoginPage(page);
    ticketPricePage = new TicketPricePage(page);

    user = {
      email: 'test@agest.vn',
      password: '123456789'
    };
  });

  // === @Test ===
  test('testUserCanCheckTicketPrices', async () => {
    await homePage.open();
    await homePage.goToTicketPricePage();

    // Java: Assert.assertTrue(ticketPricePage.isTicketPriceTableDisplayed())
    expect(await ticketPricePage.isTicketPriceTableDisplayed()).toBeTruthy();
  });
});
