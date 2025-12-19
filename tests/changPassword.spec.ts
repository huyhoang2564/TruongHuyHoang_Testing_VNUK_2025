import { test, expect } from '@playwright/test';

import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { ChangePasswordPage } from '../pages/ChangePasswordPage';

import type { User } from '../models/User';

test.describe('ChangePasswordTest', () => {
  let homePage: HomePage;
  let loginPage: LoginPage;
  let changePasswordPage: ChangePasswordPage;
  let user: User;

  test.beforeEach(async ({ page }) => {
    // Init data (tương đương @BeforeMethod)
    homePage = new HomePage(page);
    loginPage = new LoginPage(page);
    changePasswordPage = new ChangePasswordPage(page);

    user = { email: 'test@agest.vn', password: 'Anhkhoa6118' };
  });

  test.afterEach(async () => {
    // Playwright tự đóng context/page sau mỗi test (nếu bạn chạy theo config mặc định).
    // Không cần quit driver như Selenium.
  });

  async function loginAndGoToChangePassword() {
    await homePage.open();
    await homePage.goToLoginPage();
    await loginPage.login(user);
    await homePage.goToChangePasswordPage();
  }

  test('ChangePasswordCorrectly', async () => {
    await loginAndGoToChangePassword();

    await changePasswordPage.changePassword('123456789', 'Anhkhoa6118', 'Anhkhoa6118');
    expect(await changePasswordPage.getSuccessMessage()).toBe('Your password has been updated!');
  });

  test('ChangePasswordWithIncorrectCurrentPassword', async () => {
    await loginAndGoToChangePassword();

    await changePasswordPage.changePassword('wrongpassword', 'Anhkhoa6118', 'Anhkhoa6118');
    expect(await changePasswordPage.getErrorMessage()).toBe(
      'An error occurred when attempting to change the password. Maybe your current password is incorrect.'
    );
  });

  test('ChangePasswordWithNonMatchingConfirmation', async () => {
    await loginAndGoToChangePassword();

    await changePasswordPage.changePassword('Anhkhoa6118', 'Anhkhoa6118', 'Anhkhoa123213');
    expect(await changePasswordPage.getErrorMessage()).toBe(
      'Password change failed. Please correct the errors and try again.'
    );
  });

  test('ChangePasswordWithShortNewPassword', async () => {
    await loginAndGoToChangePassword();

    await changePasswordPage.changePassword('Anhkhoa6118', '12345', '12345');
    expect(await changePasswordPage.getErrorMessage()).toBe(
      'Password change failed. Please correct the errors and try again.'
    );
  });

  test('ChangePasswordWithEmptyCurrentPassword', async () => {
    await loginAndGoToChangePassword();

    await changePasswordPage.changePassword('', 'Anhkhoa6118', 'Anhkhoa6118');
    expect(await changePasswordPage.getErrorMessage()).toBe(
      'Password change failed. Please correct the errors and try again.'
    );
  });

  test('ChangePasswordWithEmptyConfirmationPassword', async () => {
    await loginAndGoToChangePassword();

    await changePasswordPage.changePassword('Anhkhoa6118', 'Anhkhoa6118', '');
    expect(await changePasswordPage.getErrorMessage()).toBe(
      'Password change failed. Please correct the errors and try again.'
    );
  });

  test('ChangePasswordWithAllFieldsEmpty', async () => {
    await loginAndGoToChangePassword();

    await changePasswordPage.changePassword('', '', '');
    expect(await changePasswordPage.getErrorMessage()).toBe(
      'Password change failed. Please correct the errors and try again.'
    );
  });

  test('ChangePasswordWithExceedingMaxLengthNewPassword', async () => {
    await loginAndGoToChangePassword();

    const longPassword = 'A'.repeat(101);
    await changePasswordPage.changePassword('Anhkhoa6118', longPassword, longPassword);
    expect(await changePasswordPage.getErrorMessage()).toBe(
      'Password change failed. Please correct the errors and try again.'
    );
  });
});
