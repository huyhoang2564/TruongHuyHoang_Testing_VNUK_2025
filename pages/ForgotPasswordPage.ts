
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ForgotPasswordPage extends BasePage {
    private readonly emailTextBoxLocator: Locator;
    private readonly sendButtonLocator: Locator;
    private readonly messageErrorLocator: Locator;
    private readonly messageSuccessLocator: Locator; // Assuming there is one
    private readonly allImagesLocator: Locator;
    private readonly allLinksLocator: Locator;
    private readonly allButtonsLocator: Locator;
    private readonly pageContentLocator: Locator;

    constructor(page: Page) {
        super(page);

        this.emailTextBoxLocator = page.locator('#email'); // Educated guess, will fallback to input[type=email] or similar if needed. Actually usually it's #email or #username
        this.sendButtonLocator = page.locator("input[type='submit'][value='Send Instructions']"); // Adjust selector based on typical patterns or user description. User says "Click button to send password reset instruction"
        // Using a more generic selector for the button just in case

        // Attempting to match the style of other pages
        this.messageErrorLocator = page.locator('p.message.error'); // Or just .message
        this.messageSuccessLocator = page.locator('p.message.success'); // Or just .message or .success

        this.allImagesLocator = page.locator('img');
        this.allLinksLocator = page.locator('a'); // Common for base check
        this.allButtonsLocator = page.locator('button, input[type=submit], input[type=button]');
        this.pageContentLocator = page.locator('body');
    }

    public get emailInput(): Locator {
        return this.emailTextBoxLocator;
    }

    public get sendButton(): Locator {
        return this.sendButtonLocator;
    }

    async fillEmail(email: string): Promise<void> {
        await this.emailTextBoxLocator.fill(email);
    }

    async clickSendButton(): Promise<void> {
        await this.sendButtonLocator.click();
    }

    async getErrorMessage(): Promise<string> {
        // Wait for error
        try {
            await this.page.locator('.message.error').waitFor({ state: 'visible', timeout: 5000 });
            return (await this.page.locator('.message.error').innerText()).trim();
        } catch {
            // Try generic
            return (await this.page.locator('.message').innerText()).trim();
        }
    }

    async getSuccessMessage(): Promise<string> {
        return (await this.messageSuccessLocator.innerText()).trim();
    }

}
