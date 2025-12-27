import { test, expect } from '@playwright/test';

import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import type { User } from '../models/User';

test.describe('Home Page Test Cases', () => {
  let homePage: HomePage;
  let loginPage: LoginPage;
  let validUser: User;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    loginPage = new LoginPage(page);
    validUser = { email: 'test@agest.vn', password: 'Anhkhoa6118' };
  });

  /**
   * HOM-01: UI of Home page displays properly
   * Precondition: None
   * Steps:
   *   1. Navigate to Railway
   *   2. Observe the UI of Home page
   *   3. Hover mouse on all links/buttons
   * Expected Results:
   *   1. No misspelled words, no broken images
   *   2. All links work correctly
   *   3. Tab index works correctly
   */
  test('HOM-01: UI of Home page displays properly', async () => {
    await test.step('Step 1: Navigate to Railway', async () => {
      await homePage.open();
    });

    await test.step('Step 2: Observe the UI of Home page', async () => {
      const brokenImages = await homePage.getAllBrokenImages();
      expect(brokenImages.length).toBe(0);

      const pageContent = await homePage.getPageContentText();
      expect(pageContent.length).toBeGreaterThan(0);

      const headerText = await homePage.getHeaderText();
      expect(headerText).toBeTruthy();
    });

    await test.step('Step 3: Hover mouse on all links/buttons', async () => {
      const allLinks = await homePage.getAllLinks();
      expect(allLinks.length).toBeGreaterThan(0);

      const hoverCheckResult = await homePage.checkTabsHoverState();
      expect(hoverCheckResult).toBe(true);

      const tabIndexResult = await homePage.checkTabIndexNavigation();
      expect(tabIndexResult).toBe(true);
    });
  });

  /**
   * HOM-02: User can navigate to all required tabs when not logged in yet
   * Precondition: None
   * Steps:
   *   1. Navigate to Railway
   *   2. Click on each tab
   * Expected Results:
   *   1. Tabs: Home, FAQ, Contact, Timetable, Book ticket, Register, Login
   *   2. The corresponding pages display properly
   */
  test('HOM-02: User can navigate to all required tabs when not logged in yet', async () => {
    await test.step('Step 1: Navigate to Railway', async () => {
      await homePage.open();
    });

    await test.step('Step 2: Verify all required tabs are visible for non-logged in users', async () => {
      const visibleTabs = await homePage.getVisibleTabsNotLoggedIn();
      const expectedTabs = ['Home', 'FAQ', 'Contact', 'Timetable', 'Book ticket', 'Register', 'Login'];

      for (const expectedTab of expectedTabs) {
        expect(visibleTabs).toContain(expectedTab);
      }
    });

    await test.step('Navigate to each tab and verify the page displays properly', async () => {
      await homePage.goToHomePage();
      expect(await homePage.getHeaderText()).toBeTruthy();

      await homePage.goToFAQPage();
      expect(await homePage.getHeaderText()).toBeTruthy();

      await homePage.goToContactPage();
      expect(await homePage.getHeaderText()).toBeTruthy();

      await homePage.goToTimetablePage();
      expect(await homePage.getHeaderText()).toBeTruthy();

      await homePage.goToBookTicketPage();
      expect(await homePage.getHeaderText()).toBeTruthy();

      await homePage.goToRegisterPage();
      expect(await homePage.getHeaderText()).toBeTruthy();

      await homePage.goToLoginPage();
      expect(await homePage.getHeaderText()).toBeTruthy();
    });
  });

  /**
   * HOM-03: User can navigate to all required tabs when logged in
   * Precondition: None
   * Steps:
   *   1. Navigate to Railway
   *   2. Go to Login tab
   *   3. Enter valid info to the fields: Email, Password
   *   4. Click Login button
   *   5. Redirect to Home page
   * Expected Results:
   *   1. Tabs: Home, FAQ, Contact, Timetable, Ticket price, Book ticket, Change password, Log out
   *   2. The corresponding pages display properly
   */
  test('HOM-03: User can navigate to all required tabs when logged in', async () => {
    await test.step('Step 1: Navigate to Railway', async () => {
      await homePage.open();
    });

    await test.step('Step 2: Go to Login tab', async () => {
      await homePage.goToLoginPage();
    });

    await test.step('Step 3 & 4: Enter valid info to the fields: Email, Password', async () => {
      await test.step(`Data: Email=${validUser.email}, Password=*****`, async () => { });
      await loginPage.login(validUser);
    });

    await test.step('Step 5: Verify redirect to Home page and user is logged in', async () => {
      const greetingText = await homePage.getGreetingText();
      expect(greetingText).toBe(`Welcome ${validUser.email}`);

      const visibleTabs = await homePage.getVisibleTabsLoggedIn();

      const expectedTabs = [
        'Home',
        'FAQ',
        'Contact',
        'Timetable',
        'Ticket price',
        'Book ticket',
        'Change password',
        'Log out'
      ];

      for (const expectedTab of expectedTabs) {
        expect(visibleTabs).toContain(expectedTab);
      }
    });

    await test.step('Navigate to each tab and verify the page displays properly', async () => {
      await homePage.goToHomePage();
      expect(await homePage.getHeaderText()).toBeTruthy();

      await homePage.goToFAQPage();
      expect(await homePage.getHeaderText()).toBeTruthy();

      await homePage.goToContactPage();
      expect(await homePage.getHeaderText()).toBeTruthy();

      await homePage.goToTimetablePage();
      expect(await homePage.getHeaderText()).toBeTruthy();

      await homePage.goToTicketPricePage();
      expect(await homePage.getHeaderText()).toBeTruthy();

      await homePage.goToBookTicketPage();
      expect(await homePage.getHeaderText()).toBeTruthy();

      await homePage.goToChangePasswordPage();
      expect(await homePage.getHeaderText()).toBeTruthy();

      expect(await homePage.getGreetingText()).toBe(`Welcome ${validUser.email}`);
    });
  });

  /**
   * HOM-04: All links work correctly
   * Precondition: None
   * Steps:
   *   1. Navigate to Railway
   *   2. Move mouse over all and click links
   * Expected Results:
   *   The corresponding pages display properly
   */
  test('HOM-04: All links work correctly', async () => {
    await test.step('Step 1: Navigate to Railway', async () => {
      await homePage.open();
    });

    await test.step('Step 2: Get all links and verify they work', async () => {
      const allLinks = await homePage.getAllLinks();

      expect(allLinks.length).toBeGreaterThan(0);

      await homePage.goToHomePage();
      expect(await homePage.getHeaderText()).toBeTruthy();

      await homePage.goToLoginPage();
      expect(await homePage.getHeaderText()).toBeTruthy();

      await homePage.goToRegisterPage();
      expect(await homePage.getHeaderText()).toBeTruthy();

      await homePage.goToBookTicketPage();
      expect(await homePage.getHeaderText()).toBeTruthy();

      await homePage.goToTimetablePage();
      expect(await homePage.getHeaderText()).toBeTruthy();

      await homePage.goToContactPage();
      expect(await homePage.getHeaderText()).toBeTruthy();

      await homePage.goToFAQPage();
      expect(await homePage.getHeaderText()).toBeTruthy();

      await homePage.goToHomePage();
      expect(await homePage.getHeaderText()).toBeTruthy();
    });
  });

  /**
   * HOM-05: An error message displays when user tries to navigate to a page that doesn't exist
   * Precondition: None
   * Steps:
   *   1. Navigate to Railway
   *   2. Move mouse over buttons/links
   *   3. Click the buttons/links that lead to non-existent pages
   * Expected Results:
   *   Show the 403/404/500 errors
   */
  test('HOM-05: An error message displays when navigating to non-existent page', async () => {
    await test.step('Step 1: Navigate to Railway', async () => {
      await homePage.open();
    });

    await test.step('Step 2 & 3: Navigate to a non-existent page', async () => {
      await homePage.navigateToNonExistentPage();
    });

    await test.step('Expected Result: Verify error page is displayed', async () => {
      const isError = await homePage.isErrorPage();

      expect(isError).toBe(true);

      const errorMessage = await homePage.getErrorPageMessage();
    });
  });
});
