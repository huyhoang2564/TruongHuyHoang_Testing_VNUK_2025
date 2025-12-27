
import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { ContactPage } from '../pages/ContactPage';

test.describe('Contact Page Test Cases', () => {
  let homePage: HomePage;
  let contactPage: ContactPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    contactPage = new ContactPage(page);
  });

  test('CON-01: UI of Contact page display properly', async () => {
    await homePage.open();
    await homePage.goToContactPage();

    // Check spelling/images
    const brokenImages = await contactPage.getAllBrokenImages();
    expect(brokenImages.length).toBe(0);

    // Hover check
    expect(await contactPage.checkButtonsHoverState()).toBe(true);

    // Tab index
    expect(await contactPage.checkTabIndexNavigation()).toBe(true);
  });

  test('CON-02: User can navigate to corresponding answer when clicking on the link', async () => {
    await homePage.open();
    await homePage.goToContactPage();

    // Check if email link is present and clickable
    await contactPage.clickEmailLink();
  });
});
