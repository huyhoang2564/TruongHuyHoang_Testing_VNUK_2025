import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';

import type { User } from '../models/User';

test.describe('LoginTest', () => {
  let homePage: HomePage;
  let loginPage: LoginPage;

  let user: User;
  let nonPassword: User;
  let nonUser: User;
  let emailWithSQLquery: User;
  let passwordWithSQLquery: User;
  let emailBlank: User;
  let passwordBlank: User;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    loginPage = new LoginPage(page);

    user = { email: 'test@agest.vn', password: '123456789' };
    nonPassword = { email: 'test@agest.vn', password: 'adadad' };

    emailWithSQLquery = { email: "' OR 1=1 --", password: '123456789' };
    passwordWithSQLquery = { email: 'test@agest.vn', password: "' OR 1=1 --" };

    emailBlank = { email: '', password: '123456789' };
    passwordBlank = { email: 'test@agest.vn', password: '' };

    nonUser = {
      email: faker.internet.email(),
      password: faker.internet.password()
    };
  });

  test('ValidAccount', async () => {
    await homePage.open();
    await homePage.goToLoginPage();

    await loginPage.login(user);

    expect(await homePage.getGreetingText()).toBe(`Welcome ${user.email}`);
  });

  test('NonExistedAccount', async () => {
    await homePage.open();
    await homePage.goToLoginPage();

    await loginPage.login(nonUser);

    expect(await loginPage.getErrorMessage()).toBe(
      'Invalid username or password. Please try again.'
    );
  });

  test('InvalidPasswordAccount', async () => {
    await homePage.open();
    await homePage.goToLoginPage();

    await loginPage.login(nonPassword);

    expect(await loginPage.getErrorMessage()).toBe(
      'Invalid username or password. Please try again.'
    );
  });

  test('AccountWithEmailSQLquery', async () => {
    await homePage.open();
    await homePage.goToLoginPage();

    await loginPage.login(emailWithSQLquery);

    expect(await loginPage.getErrorMessage()).toBe(
      'Invalid username or password. Please try again.'
    );
  });

  test('AccountWithPasswordSQLquery', async () => {
    await homePage.open();
    await homePage.goToLoginPage();

    await loginPage.login(passwordWithSQLquery);

    expect(await loginPage.getErrorMessage()).toBe(
      'Invalid username or password. Please try again.'
    );
  });

  test('AccountWithEmailBlank', async () => {
    await homePage.open();
    await homePage.goToLoginPage();

    await loginPage.login(emailBlank);

    expect(await loginPage.getErrorMessage()).toBe(
      'There was a problem with your login and/or errors exist in your form.'
    );
  });

  test('AccountWithPasswordBlank', async () => {
    await homePage.open();
    await homePage.goToLoginPage();

    await loginPage.login(passwordBlank);

    expect(await loginPage.getErrorMessage()).toBe(
      'There was a problem with your login and/or errors exist in your form.'
    );
  });
});
