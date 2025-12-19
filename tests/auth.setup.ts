import { test } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';

test('global setup', async ({ page }) => {
  const homePage = new HomePage(page);
  const loginPage = new LoginPage(page);

  await homePage.open();
  await homePage.goToLoginPage();
  await loginPage.login({
    email: 'test@agest.vn',
    password: '123456789'
  });

  await page.context().storageState({ path: 'auth.json' });
});
