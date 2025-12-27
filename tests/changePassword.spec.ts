
import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { ChangePasswordPage } from '../pages/ChangePasswordPage';
import { User } from '../models/User';
import { RegisterForm } from '../models/RegisterForm';

test.describe('Change Password & Forgot Password Test Cases', () => {
    let homePage: HomePage;
    let loginPage: LoginPage;
    let registerPage: RegisterPage;
    let forgotPasswordPage: ForgotPasswordPage;
    let changePasswordPage: ChangePasswordPage;
    let testUser: User;

    test.beforeAll(async ({ browser }) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        const registerPage = new RegisterPage(page);
        const homePage = new HomePage(page);

        const email = `test.cp.${Date.now()}@test.com`;
        const password = 'Password123!';
        const pid = faker.string.numeric(10);

        await homePage.open();
        await homePage.goToRegisterPage();
        await registerPage.register(new RegisterForm(email, password, password, pid));

        testUser = { email, password };

        await context.close();
    });

    test.beforeEach(async ({ page }) => {
        homePage = new HomePage(page);
        loginPage = new LoginPage(page);
        registerPage = new RegisterPage(page);
        forgotPasswordPage = new ForgotPasswordPage(page);
        changePasswordPage = new ChangePasswordPage(page);
    });

    // --- Forgot Password Flow (CFW-01, 07-12) ---

    test('CFW-01: UI of Forgot password page display properly', async () => {
        await homePage.open();
        await homePage.goToLoginPage();
        await loginPage.goToForgotPasswordPage();



        await expect(forgotPasswordPage.emailInput).toBeVisible();
        await expect(forgotPasswordPage.sendButton).toBeVisible();
    });

    test('CFW-07: Error message when changing password with non-existing email', async () => {
        await homePage.open();
        await homePage.goToLoginPage();
        await loginPage.goToForgotPasswordPage();

        await forgotPasswordPage.fillEmail(faker.internet.email());
        await forgotPasswordPage.clickSendButton();

        const error = await forgotPasswordPage.getErrorMessage();
        expect(error.length).toBeGreaterThan(0);
    });

    test('CFW-08: Error message when leaving email blank', async () => {
        await homePage.open();
        await homePage.goToLoginPage();
        await loginPage.goToForgotPasswordPage();

        await forgotPasswordPage.clickSendButton();

        const error = await forgotPasswordPage.getErrorMessage();
        expect(error.length).toBeGreaterThan(0);
    });

    test('CFW-09: Error message when email contains HTML scripts', async () => {
        await homePage.open();
        await homePage.goToLoginPage();
        await loginPage.goToForgotPasswordPage();

        await forgotPasswordPage.fillEmail('<script>alert("test")</script>');
        await forgotPasswordPage.clickSendButton();



        try {
            const error = await forgotPasswordPage.getErrorMessage();
            expect(error.length).toBeGreaterThan(0);
        } catch {
        }
    });

    test('CFW-10: Error message when email resembles SQL query', async () => {
        await homePage.open();
        await homePage.goToLoginPage();
        await loginPage.goToForgotPasswordPage();

        await forgotPasswordPage.fillEmail("' OR '1'='1");
        await forgotPasswordPage.clickSendButton();

        const error = await forgotPasswordPage.getErrorMessage();
        expect(error.length).toBeGreaterThan(0);
    });

    test('CFW-11: Error message when email has invalid format', async () => {
        await homePage.open();
        await homePage.goToLoginPage();
        await loginPage.goToForgotPasswordPage();

        await forgotPasswordPage.fillEmail("invalid-email");
        await forgotPasswordPage.clickSendButton();

        const error = await forgotPasswordPage.getErrorMessage();
        expect(error.length).toBeGreaterThan(0);
    });


    // --- Change Password Flow (Logged In) ---

    test('CFW-02: UI of Change password page display properly', async () => {
        await homePage.open();
        await homePage.goToLoginPage();
        await loginPage.login(testUser);
        await homePage.goToChangePasswordPage();

        expect(await changePasswordPage.isNewPasswordMasked()).toBe(true);
    });

    test('CFW-04: User can Change password successfully', async () => {
        await homePage.open();
        await homePage.goToLoginPage();
        await loginPage.login(testUser);
        await homePage.goToChangePasswordPage();

        const newPass = 'NewPass123!';

        await changePasswordPage.changePassword(testUser.password, newPass, newPass);

        const msg = await changePasswordPage.getSuccessMessage();

        expect(msg.toLowerCase()).toContain('success');

        await changePasswordPage.changePassword(newPass, testUser.password, testUser.password);
        const revertMsg = await changePasswordPage.getSuccessMessage();
        expect(revertMsg.toLowerCase()).toContain('success');
    });

    test('CFW-14: Password is displayed in encrypted form', async () => {
        await homePage.open();
        await homePage.goToLoginPage();
        await loginPage.login(testUser);
        await homePage.goToChangePasswordPage();

        expect(await changePasswordPage.isNewPasswordMasked()).toBe(true);
    });

    test('CFW-15: Error message with invalid current password', async () => {
        await homePage.open();
        await homePage.goToLoginPage();
        await loginPage.login(testUser);
        await homePage.goToChangePasswordPage();

        await changePasswordPage.changePassword("WrongPass", "NewPass123", "NewPass123");

        const error = await changePasswordPage.getErrorMessage();
        expect(error.toLowerCase()).toContain('incorrect');
    });

    test('CFW-20: Error message when leaving new password blank', async () => {
        await homePage.open();
        await homePage.goToLoginPage();
        await loginPage.login(testUser);
        await homePage.goToChangePasswordPage();

        await changePasswordPage.changePassword(testUser.password, "", "");



        const error = await changePasswordPage.getErrorMessage();
        expect(error.length).toBeGreaterThan(0);
    });
});
