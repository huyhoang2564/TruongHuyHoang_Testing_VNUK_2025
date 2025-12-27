import { test, expect } from '@playwright/test';

import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';

import type { User } from '../models/User';

test.describe('LogoutTest', () => {
  let homePage: HomePage;
  let loginPage: LoginPage;
  let user: User;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    loginPage = new LoginPage(page);

    user = { email: 'test@agest.vn', password: 'Anhkhoa6118' };
  });

  test('LogoutSuccessfull', async () => {
    await test.step('Navigate to Login page', async () => {
      await homePage.open();
      await homePage.goToLoginPage();
    });

    await test.step('Login with valid user', async () => {
      await test.step(`Data: email=${user.email}, password=*****`, async () => { });
      await loginPage.login(user);
    });

    await test.step('Logout', async () => {
      await homePage.goToLogoutPage();
    });
  });

  test('LogoutandLoginAgain', async () => {
    await test.step('Login first time', async () => {
      await homePage.open();
      await homePage.goToLoginPage();

      await test.step(`Data: email=${user.email}, password=*****`, async () => { });
      await loginPage.login(user);
    });

    await test.step('Logout', async () => {
      await homePage.goToLogoutPage();
    });

    await test.step('Login again', async () => {
      await homePage.goToLoginPage();
      await test.step(`Data: email=${user.email}, password=*****`, async () => { });
      await loginPage.login(user);
    });
  });

  test('accessRestrictedPageAfterLogout', async ({ page }) => {
    await test.step('Login', async () => {
      await homePage.open();
      await homePage.goToLoginPage();

      await test.step(`Data: email=${user.email}, password=*****`, async () => { });
      await loginPage.login(user);
    });

    await test.step('Go to restricted page (assuming My Ticket or similar)', async () => {
      // The original code named this restrictedPage, usually some page requiring auth
      await homePage.goToRestrictedPage();
    });

    await test.step('Logout', async () => {
      await homePage.goToLogoutPage();
    });

    await test.step('Verify cannot access restricted page via back button', async () => {
      await page.goBack();
      await expect(page).toHaveURL(/Login/i);
    });
  });

  test('LogoutTabVisibility', async () => {
    await test.step('Navigate to Home', async () => {
      await homePage.open();
    });

    await test.step('Verify Logout tab is NOT visible initially', async () => {
      expect(await homePage.isLogoutTabVisible()).toBeFalsy();
    });

    await test.step('Login', async () => {
      await homePage.goToLoginPage();
      await test.step(`Data: email=${user.email}, password=*****`, async () => { });
      await loginPage.login(user);
    });

    await test.step('Verify Logout tab IS visible after login', async () => {
      expect(await homePage.isLogoutTabVisible()).toBeTruthy();
    });

    await test.step('Logout', async () => {
      await homePage.goToLogoutPage();
    });

    await test.step('Verify Logout tab is NOT visible after logout', async () => {
      expect(await homePage.isLogoutTabVisible()).toBeFalsy();
    });
  });
});
