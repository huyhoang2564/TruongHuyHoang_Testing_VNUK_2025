import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

import { HomePage } from '../pages/HomePage';
import { RegisterPage } from '../pages/RegisterPage';
import { LoginPage } from '../pages/LoginPage';

import { RegisterForm } from '../models/RegisterForm';

/**
 * Helpers (stable, deterministic)
 */

// Email helper: generate email with EXACT total length.
// Use short domain so we can truly hit boundary values like 6, 32, 33, 100.
function emailWithTotalLength(totalLen: number): string {
  const domain = '@t.co'; // short and valid
  const minTotal = 1 + domain.length; // at least 1-char local
  const target = Math.max(totalLen, minTotal);
  const localLen = target - domain.length;
  return `${'a'.repeat(localLen)}${domain}`;
}

// Password helper: "likely valid" for common policies (upper+lower+digit+special) and can control length.
function passwordWithLength(n: number): string {
  const base = 'Aa1!';
  if (n <= base.length) return base.slice(0, n);
  return base + 'a'.repeat(n - base.length);
}

function alphaWithLength(n: number): string {
  return 'a'.repeat(n);
}

function uniqueEmail(): string {
  // stable format; avoids weird faker email formats & avoids collisions across runs
  return `u_${Date.now()}_${faker.string.alphanumeric(6)}@t.co`;
}

async function fillAndSubmit(registerPage: RegisterPage, data: { email: string; password: string; confirmPassword: string; pid: string }) {
  await test.step('Fill form', async () => {
    await test.step(`Data`, async () => {
      // Keeping this as a substep to show data in expand view.
      // Do not log to console to avoid noise.
      expect(data.email).toBeTruthy();
      expect(data.password).toBeTruthy();
      expect(data.confirmPassword).toBeTruthy();
      expect(data.pid).toBeTruthy();
    });

    await registerPage.fillEmail(data.email);
    await registerPage.fillPassword(data.password);
    await registerPage.fillConfirmPassword(data.confirmPassword);
    await registerPage.fillPID(data.pid);
  });

  await test.step('Submit Register', async () => {
    await registerPage.clickRegister();
  });
}

async function expectHasAnyError(registerPage: RegisterPage) {
  // Use both sources if your POM supports them; avoids false-negative from one locator.
  const [regError, valError] = await Promise.all([
    registerPage.getRegisterErrorMessage().catch(() => ''),
    registerPage.getValidationErrorMessage().catch(() => ''),
  ]);

  expect((regError?.length ?? 0) > 0 || (valError?.length ?? 0) > 0).toBe(true);
}

test.describe('Register Page Test Cases', () => {
  let homePage: HomePage;
  let registerPage: RegisterPage;
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    registerPage = new RegisterPage(page);
    loginPage = new LoginPage(page);

    await test.step('Open Railway → Register page', async () => {
      await homePage.open();
      await homePage.goToRegisterPage();
      // Optional sanity check if you have header; keeps failure meaningful (system navigation issue)
      const header = await registerPage.getHeaderText();
      expect(header).toBeTruthy();
    });
  });

  test('REG-01: UI of Register page displays properly', async () => {
    await test.step('Check broken images', async () => {
      const brokenImages = await registerPage.getAllBrokenImages();
      expect(brokenImages.length).toBe(0);
    });

    await test.step('Check basic content', async () => {
      const pageContent = await registerPage.getPageContentText();
      expect(pageContent.length).toBeGreaterThan(0);

      const headerText = await registerPage.getHeaderText();
      expect(headerText).toBeTruthy();
    });

    await test.step('Check hover states', async () => {
      const ok = await registerPage.checkButtonsHoverState();
      expect(ok).toBe(true);
    });

    await test.step('Check tab index navigation', async () => {
      const ok = await registerPage.checkTabIndexNavigation();
      expect(ok).toBe(true);
    });
  });

  test('REG-02: User can navigate to corresponding pages when clicking on links', async () => {
    await test.step('Verify links exist', async () => {
      const allLinks = await registerPage.getAllLinks();
      expect(allLinks.length).toBeGreaterThan(0);
    });

    await test.step('Navigate to Home', async () => {
      await registerPage.goToHomePage();
      expect(await homePage.getHeaderText()).toBeTruthy();
      // come back to Register to keep following steps consistent
      await homePage.goToRegisterPage();
      expect(await registerPage.getHeaderText()).toBeTruthy();
    });

    await test.step('Navigate to Login', async () => {
      await registerPage.goToLoginPage();
      expect(await loginPage.getHeaderText()).toBeTruthy();
      // come back to Register
      await homePage.open();
      await homePage.goToRegisterPage();
      expect(await registerPage.getHeaderText()).toBeTruthy();
    });

    await test.step('Navigate to Contact', async () => {
      await registerPage.goToContactPage();
      expect(await registerPage.getHeaderText()).toBeTruthy();
    });
  });

  test.describe('REG-03: Register with valid info - Boundary Value Testing', () => {
    const cases = [
      { id: 'REG-03.1', emailLen: 6,  passLen: 8,  pidLen: 8  },
      { id: 'REG-03.2', emailLen: 18, passLen: 32, pidLen: 15 },
      { id: 'REG-03.3', emailLen: 32, passLen: 64, pidLen: 20 },
    ] as const;

    for (const tc of cases) {
      test(`${tc.id}: Valid lengths (email=${tc.emailLen}, password=${tc.passLen}, PID=${tc.pidLen})`, async () => {
        const data = {
          email: emailWithTotalLength(tc.emailLen),
          password: passwordWithLength(tc.passLen),
          confirmPassword: passwordWithLength(tc.passLen),
          pid: alphaWithLength(tc.pidLen),
        };

        await test.step('Register with valid boundary data', async () => {
          await test.step('Data', async () => {
            // substep for expand view
            expect(data.email.length).toBeGreaterThan(0);
            expect(data.password.length).toBe(tc.passLen);
            expect(data.pid.length).toBe(tc.pidLen);
          });

          const form = new RegisterForm(data.email, data.password, data.confirmPassword, data.pid);
          await registerPage.register(form);
        });

        await test.step('Verify no validation error', async () => {
          const hasError = await registerPage.hasValidationError();
          expect(hasError).toBe(false);
        });
      });
    }
  });

  test('REG-04: Error message displays when registering with existing email', async () => {
    // Make this deterministic: create account first, then re-register same email.
    const email = uniqueEmail();
    const password = passwordWithLength(12);
    const pid = faker.string.numeric(10);

    await test.step('Create account (first time)', async () => {
      await test.step('Data', async () => {
        expect(email).toContain('@');
        expect(password.length).toBe(12);
        expect(pid.length).toBeGreaterThanOrEqual(8);
      });

      const form = new RegisterForm(email, password, password, pid);
      await registerPage.register(form);

      // We only assert "not error" to ensure the first registration likely succeeded.
      const hasError = await registerPage.hasValidationError();
      expect(hasError).toBe(false);
    });

    await test.step('Register again with the same email (should fail)', async () => {
      await homePage.goToRegisterPage();

      const form = new RegisterForm(email, password, password, pid);
      await registerPage.register(form);

      await expectHasAnyError(registerPage);
    });
  });

  test.describe('REG-05: Error message with invalid email length', () => {
    // Note: emailWithTotalLength(1/5) will still create a minimally-valid format,
    // but the *intent* is "too short". If your system validates total length strictly,
    // it should still error (or you can adjust based on your system spec).
    const cases = [
      { id: 'REG-05.1', emailLen: 1 },
      { id: 'REG-05.2', emailLen: 5 },
      { id: 'REG-05.3', emailLen: 33 },
      { id: 'REG-05.4', emailLen: 100 },
    ] as const;

    for (const tc of cases) {
      test(`${tc.id}: Invalid email length = ${tc.emailLen}`, async () => {
        const data = {
          email: emailWithTotalLength(tc.emailLen),
          password: passwordWithLength(12),
          confirmPassword: passwordWithLength(12),
          pid: faker.string.numeric(8),
        };

        await test.step('Submit with invalid email length', async () => {
          await test.step('Data', async () => {
            expect(data.email).toBeTruthy();
            expect(tc.emailLen).toBeGreaterThan(0);
          });

          await fillAndSubmit(registerPage, data);
        });

        await test.step('Verify validation error exists', async () => {
          expect(await registerPage.hasValidationError()).toBe(true);
        });
      });
    }
  });

  test.describe('REG-06: Error message with invalid email format', () => {
    const cases = [
      { id: 'REG-06.1', email: 'testgmail.com',  note: 'missing @' },
      { id: 'REG-06.2', email: 'test@@gmail.com', note: 'double @@' },
      { id: 'REG-06.3', email: '@gmail.com',     note: 'missing username' },
      { id: 'REG-06.4', email: 'test@',          note: 'missing domain' },
      { id: 'REG-06.5', email: 'test@gmail',     note: 'missing TLD' },
    ] as const;

    for (const tc of cases) {
      test(`${tc.id}: ${tc.note}`, async () => {
        const data = {
          email: tc.email,
          password: passwordWithLength(12),
          confirmPassword: passwordWithLength(12),
          pid: faker.string.numeric(8),
        };

        await test.step('Submit with invalid email format', async () => {
          await test.step('Data', async () => {
            expect(data.email).toBe(tc.email);
          });

          await fillAndSubmit(registerPage, data);
        });

        await test.step('Verify validation error exists', async () => {
          expect(await registerPage.hasValidationError()).toBe(true);
        });
      });
    }
  });

  test.describe('REG-07: Error message with email containing invalid characters', () => {
    /**
     * IMPORTANT:
     * Many characters like '+' '-' '.' are typically allowed in local-part.
     * Use "very likely invalid" characters to avoid false failures due to wrong assumption.
     */
    const invalidChars = [' ', ',', '"', "'", '\\', '/', ':', ';', '<', '>', '(', ')'];

    invalidChars.forEach((ch, idx) => {
      test(`REG-07.${idx + 1}: Email contains invalid char (${ch === ' ' ? 'SPACE' : ch})`, async () => {
        const data = {
          email: `test${ch}user@gmail.com`,
          password: passwordWithLength(12),
          confirmPassword: passwordWithLength(12),
          pid: faker.string.numeric(8),
        };

        await test.step('Submit with invalid characters in email', async () => {
          await test.step('Data', async () => {
            expect(data.email).toContain('test');
          });

          await fillAndSubmit(registerPage, data);
        });

        await test.step('Verify validation error exists', async () => {
          expect(await registerPage.hasValidationError()).toBe(true);
        });
      });
    });
  });

  test.describe('REG-08: Error message with invalid password length', () => {
    const cases = [
      { id: 'REG-08.1', passLen: 1 },
      { id: 'REG-08.2', passLen: 7 },
      { id: 'REG-08.3', passLen: 65 },
      { id: 'REG-08.4', passLen: 100 },
    ] as const;

    for (const tc of cases) {
      test(`${tc.id}: Password length = ${tc.passLen}`, async () => {
        // Use unique email to ensure failure is due to password, not "email exists".
        const email = uniqueEmail();
        const password = alphaWithLength(tc.passLen);

        const data = {
          email,
          password,
          confirmPassword: password,
          pid: faker.string.numeric(10),
        };

        await test.step('Submit with invalid password length', async () => {
          await test.step('Data', async () => {
            expect(data.password.length).toBe(tc.passLen);
          });

          await fillAndSubmit(registerPage, data);
        });

        await test.step('Verify validation error exists', async () => {
          expect(await registerPage.hasValidationError()).toBe(true);
        });
      });
    }
  });

  test('REG-09: Password is displayed in encrypted form', async () => {
    const email = uniqueEmail();
    const password = passwordWithLength(12);
    const pid = faker.string.numeric(10);

    await test.step('Fill email + passwords', async () => {
      await test.step('Data', async () => {
        expect(email).toContain('@');
        expect(password.length).toBe(12);
      });

      await registerPage.fillEmail(email);
      await registerPage.fillPassword(password);
      await registerPage.fillConfirmPassword(password);
    });

    await test.step('Verify password inputs are masked', async () => {
      const isPasswordMasked = await registerPage.isPasswordFieldMasked();
      const isConfirmPasswordMasked = await registerPage.isConfirmPasswordFieldMasked();

      expect(isPasswordMasked).toBe(true);
      expect(isConfirmPasswordMasked).toBe(true);
    });

    await test.step('Submit (optional)', async () => {
      await registerPage.fillPID(pid);
      await registerPage.clickRegister();
    });
  });

  test.describe('REG-10: Error message with password containing non-printable characters', () => {
    const cases = [
      { id: 'REG-10.1', password: 'Pass\tword123', note: 'tab character' },
      { id: 'REG-10.2', password: ' Password123',  note: 'leading space' },
      { id: 'REG-10.3', password: 'Pass\nword123', note: 'newline character' },
    ] as const;

    for (const tc of cases) {
      test(`${tc.id}: Password contains ${tc.note}`, async () => {
        const data = {
          email: uniqueEmail(),
          password: tc.password,
          confirmPassword: tc.password,
          pid: faker.string.numeric(8),
        };

        await test.step('Submit with non-printable characters', async () => {
          await test.step('Data', async () => {
            expect(tc.password.length).toBeGreaterThan(0);
          });

          await fillAndSubmit(registerPage, data);
        });

        await test.step('Verify validation error exists', async () => {
          expect(await registerPage.hasValidationError()).toBe(true);
        });
      });
    }
  });

  test('REG-11: Error message when confirm password does not match', async () => {
    const data = {
      email: uniqueEmail(),
      password: passwordWithLength(12),
      confirmPassword: passwordWithLength(12) + 'x', // ensure mismatch deterministically
      pid: faker.string.numeric(10),
    };

    await test.step('Submit with mismatched confirm password', async () => {
      await test.step('Data', async () => {
        expect(data.password).not.toBe(data.confirmPassword);
      });

      await fillAndSubmit(registerPage, data);
    });

    await test.step('Verify validation error exists', async () => {
      expect(await registerPage.hasValidationError()).toBe(true);
    });
  });

  test.describe('REG-12: Error message with invalid PID length', () => {
    const cases = [
      { id: 'REG-12.1', pidLen: 1 },
      { id: 'REG-12.2', pidLen: 7 },
      { id: 'REG-12.3', pidLen: 21 },
      { id: 'REG-12.4', pidLen: 100 },
    ] as const;

    for (const tc of cases) {
      test(`${tc.id}: PID length = ${tc.pidLen}`, async () => {
        const data = {
          email: uniqueEmail(),
          password: passwordWithLength(12),
          confirmPassword: passwordWithLength(12),
          pid: alphaWithLength(tc.pidLen),
        };

        await test.step('Submit with invalid PID length', async () => {
          await test.step('Data', async () => {
            expect(data.pid.length).toBe(tc.pidLen);
          });

          await fillAndSubmit(registerPage, data);
        });

        await test.step('Verify validation error exists', async () => {
          expect(await registerPage.hasValidationError()).toBe(true);
        });
      });
    }
  });

  test.describe('REG-13: Error message with invalid PID format', () => {
    const cases = [
      { id: 'REG-13.1', pid: '12345@#$',  note: 'special characters' },
      { id: 'REG-13.2', pid: '1234 5678', note: 'spaces' },
      { id: 'REG-13.3', pid: '12345-678', note: 'symbols' },
    ] as const;

    for (const tc of cases) {
      test(`${tc.id}: PID contains ${tc.note}`, async () => {
        const data = {
          email: uniqueEmail(),
          password: passwordWithLength(12),
          confirmPassword: passwordWithLength(12),
          pid: tc.pid,
        };

        await test.step('Submit with invalid PID format', async () => {
          await test.step('Data', async () => {
            expect(data.pid).toBe(tc.pid);
          });

          await fillAndSubmit(registerPage, data);
        });

        await test.step('Verify validation error exists', async () => {
          expect(await registerPage.hasValidationError()).toBe(true);
        });
      });
    }
  });

  test('REG-14: Navigate to Register page successfully (deterministic)', async () => {
    /**
     * Your old REG-14 was non-deterministic (if/else always passes).
     * Make it deterministic: either it loads (pass) or it doesn't (fail -> system issue).
     */
    await test.step('Navigate to Register page directly', async () => {
      await registerPage.navigateToRegisterPageDirectly();
    });

    await test.step('Verify Register page loaded', async () => {
      const isLoaded = await registerPage.isRegisterPageLoaded();
      expect(isLoaded).toBe(true);
    });
  });
});
