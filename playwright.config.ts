// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  reporter: 'html',

  timeout: 60_000,

  expect: {
    timeout: 10_000
  },

  use: {
    browserName: 'chromium', // tương đương ChromeDriver
    headless: false,         // giống Selenium (bật browser)
    viewport: null,          // giống maximize
    launchOptions: {
      args: ['--start-maximized']
    },

    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry'
  }
});
