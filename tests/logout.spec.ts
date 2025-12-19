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
    await homePage.open();
    await homePage.goToLoginPage();
    await loginPage.login(user);

    await homePage.goToLogoutPage();
  });

  test('LogoutandLoginAgain', async () => {
    await homePage.open();
    await homePage.goToLoginPage();
    await loginPage.login(user);

    await homePage.goToLogoutPage();

    await homePage.goToLoginPage();
    await loginPage.login(user);
  });

  test('accessRestrictedPageAfterLogout', async ({ page }) => {
    await homePage.open();
    await homePage.goToLoginPage();
    await loginPage.login(user);

    // Java: homePage.goToRestrictedPage();
    await homePage.goToRestrictedPage();

    // logout
    await homePage.goToLogoutPage();

    // Java: Constant.WEBDRIVER.navigate().back();
    await page.goBack();

    // Java: assertFalse(loginPage.isDisplayed(), "User should be redirected to login page after logout");
    // Giữ y hệt ý nghĩa: sau logout, back không được vào trang restricted nữa.
    // loginPage.isDisplayed() đang check p.message (message lỗi) -> không ổn để dùng ở đây.
    // Cách đúng nhất: assert vẫn ở login page hoặc greeting/logout tab không còn.
    //
    // Nếu bạn muốn "y hệt" như Java (dùng isDisplayed), vẫn gọi được:
    // expect(await loginPage.isDisplayed()).toBeFalsy();

    // ✅ Assertion ổn định nhất:
    // Sau khi logout + back, phải bị đưa về login page (URL có Login) HOẶC không còn thấy logout tab.
    await expect(page).toHaveURL(/Login/i);
  });

  test('LogoutTabVisibility', async () => {
    await homePage.open();

    // Java: assertFalse(homePage.isLogoutTabVisible(), "Log out tab should not be visible before logging in");
    expect(await homePage.isLogoutTabVisible()).toBeFalsy();

    await homePage.goToLoginPage();
    await loginPage.login(user);

    // Java code ghi assertFalse nhưng message lại nói "should be visible" (bị mâu thuẫn).
    // Hành vi đúng: sau login thì logout tab PHẢI visible.
    expect(await homePage.isLogoutTabVisible()).toBeTruthy();

    await homePage.goToLogoutPage();

    expect(await homePage.isLogoutTabVisible()).toBeFalsy();
  });
});
