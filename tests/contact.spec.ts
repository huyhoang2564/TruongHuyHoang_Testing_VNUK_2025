import { test } from '@playwright/test';

import { HomePage } from '../pages/HomePage';
import { ContactPage } from '../pages/ContactPage';
import { LoginPage } from '../pages/LoginPage';

import type { User } from '../models/User';

test.describe('ContactTest', () => {
  let homePage: HomePage;
  let contactPage: ContactPage;
  let loginPage: LoginPage;
  let user: User;

  // === @BeforeMethod ===
  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    contactPage = new ContactPage(page);
    loginPage = new LoginPage(page);

    user = {
      email: 'test@agest.vn',
      password: '123456789'
    };
  });

  // === @Test ===
  test('testSelenium', async () => {
    await homePage.open();

    await homePage.goToContactPage();

    // Java đang comment dòng này, nên giữ nguyên
    // await contactPage.clickOnlickEmail();
  });

  // === @AfterMethod ===
  test.afterEach(async () => {
    // Playwright tự đóng browser/context
    // Không cần quit driver như Selenium
  });
});
