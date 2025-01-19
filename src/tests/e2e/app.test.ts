import { test, expect } from '@playwright/test';
import { runUiTests, runAutonomousTests } from '../utils/testsprite-helpers';

test.describe('Application Flow', () => {
  test('completes signup flow', async ({ page }) => {
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Sign up")');
    await expect(page.locator('text=Account created successfully')).toBeVisible();
  });

  test('completes login flow', async ({ page }) => {
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Sign in")');
    await expect(page.locator('text=Welcome back')).toBeVisible();
  });

  test('uploads and parses resume', async ({ page }) => {
    await page.goto('/resume');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test-resume.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('test resume content')
    });
    await expect(page.getByText(/upload successful/i)).toBeVisible();
    await expect(page.getByText(/parsing complete/i)).toBeVisible();
  });

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status === 'passed') {
      await runUiTests(page);
      await runAutonomousTests();
    }
  });
});