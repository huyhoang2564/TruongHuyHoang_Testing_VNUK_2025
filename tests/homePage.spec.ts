import { test, expect } from '@playwright/test';

import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import type { User } from '../models/User';

test.describe('HomePageTest', () => {
  let homePage: HomePage;
  let loginPage: LoginPage;
  let user: User;

  // === @BeforeMethod ===
  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    loginPage = new LoginPage(page);

    user = { email: 'test@agest.vn', password: 'Anhkhoa6118' };
  });

  test('NegativeAllTabs', async () => {
    await homePage.open();

    await homePage.goToLoginPage();
    await homePage.goToRegisterPage();
    await homePage.goToBookTicketPage();
    await homePage.goToTicketPricePage();
    await homePage.goToTimetablePage();
    await homePage.goToContactPage();
    await homePage.goToFAQPage();
    await homePage.goToHomePage();
  });

  test('NegativeAllTabsWhenLogged', async () => {
    await homePage.open();

    await homePage.goToLoginPage();
    await loginPage.login(user);

    await homePage.goToMyTicketPage();
    await homePage.goToBookTicketPage();
    await homePage.goToTicketPricePage();
    await homePage.goToTimetablePage();
    await homePage.goToContactPage();
    await homePage.goToFAQPage();
    await homePage.goToHomePage();

    // Java: Assert.assertEquals(homePage.getGreetingText(), "Welcome " + user.getEmail());
    expect(await homePage.getGreetingText()).toBe(`Welcome ${user.email}`);
  });
});
