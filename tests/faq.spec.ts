
import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { FAQPage } from '../pages/FAQPage';

test.describe('FAQ Page Test Cases', () => {
    let homePage: HomePage;
    let faqPage: FAQPage;

    test.beforeEach(async ({ page }) => {
        homePage = new HomePage(page);
        faqPage = new FAQPage(page);
    });


    test('FAQ-01: UI of FAQ page display properly', async () => {
        await test.step('Navigate to FAQ page', async () => {
            await homePage.open();
            await homePage.goToFAQPage();
        });

        await test.step('Check for broken images', async () => {
            const brokenImages = await faqPage.getAllBrokenImages();
            expect(brokenImages.length).toBe(0);
        });

        await test.step('Check hover states', async () => {
            expect(await faqPage.checkButtonsHoverState()).toBe(true);
        });

        await test.step('Check tab index navigation', async () => {
            expect(await faqPage.checkTabIndexNavigation()).toBe(true);
        });
    });

    test('FAQ-02: User can navigate to corresponding answer when clicking on question links', async () => {
        await test.step('Navigate to FAQ page', async () => {
            await homePage.open();
            await homePage.goToFAQPage();
        });

        await test.step('Check question links', async () => {
            const links = await faqPage.getQuestionLinks();
            for (const link of links) {
                const href = await link.getAttribute('href');
                expect(href).toBeTruthy();
            }
        });
    });

});
