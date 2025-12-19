import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

import { HomePage } from '../pages/HomePage';
import { RegisterPage } from '../pages/RegisterPage';
import { LoginPage } from '../pages/LoginPage';

import { RegisterForm } from '../models/RegisterForm';
import type { User } from '../models/User';

function userFromRegisterForm(form: RegisterForm): User {
  return { email: form.email, password: form.password };
}

test.describe('RegisterTest', () => {
  let homePage: HomePage;
  let registerPage: RegisterPage;
  let loginPage: LoginPage;

  let registerForm: RegisterForm;
  let password: string;
  let pid: string;

  // === @BeforeMethod ===
  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    registerPage = new RegisterPage(page);
    loginPage = new LoginPage(page);

    // Java: password = faker.numerify("########");
    // TS: tạo 8 chữ số
    password = faker.string.numeric({ length: 8 });
    pid = faker.string.numeric({ length: 8 });

   registerForm = new RegisterForm(
        faker.internet.email(),
        password,
        password,
        pid
    );

    await loginPage.login(registerForm.toUser());
  });

  test('verifyUserCanRegisterSuccessfully', async () => {
    await homePage.open();

    await homePage.goToRegisterPage();
    await registerPage.register(registerForm);

    // Java: Assert.assertEquals(registerPage.getRegisterSuccessMessage(), "You're here");
    expect(await registerPage.getRegisterSuccessMessage()).toBe("You're here");

    await registerPage.goToLoginPage();
    await loginPage.login(userFromRegisterForm(registerForm));

    // Java: Assert.assertEquals(homePage.getGreetingText(), "Welcome " + registerForm.getEmail());
    expect(await homePage.getGreetingText()).toBe(`Welcome ${registerForm.email}`);
  });
});
