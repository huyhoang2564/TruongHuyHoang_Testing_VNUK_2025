import { test } from '@playwright/test';

import { HomePage } from '../pages/HomePage';
import { ContactPage } from '../pages/ContactPage';
import { LoginPage } from '../pages/LoginPage';

import type { User } from '../models/User';

test.describe('TimetableTest', () => {
  let homePage: HomePage;
  let contactPage: ContactPage;
  let loginPage: LoginPage;
  let user: User;

  // === @BeforeMethod ===
  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    contactPage = new ContactPage(page); // Java có tạo dù không dùng
    loginPage = new LoginPage(page);

    user = {
      email: 'test@agest.vn',
      password: '123456789'
    };
  });

  test('testSelenium', async () => {
    await homePage.open();

    // TC-001
    await homePage.goToTimetablePage();

    // TC-004
    await homePage.goToBookTicketPage();

    // TC-005
    await homePage.goToLoginPage();
    await loginPage.login(user);
    await homePage.goToBookTicketPage();
  });
});
