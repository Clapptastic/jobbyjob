import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { join } from 'path';

test.describe('Resume Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByPlaceholder('Email address').fill(process.env.TEST_USER_EMAIL || 'test@example.com');
    await page.getByPlaceholder('Password').fill(process.env.TEST_USER_PASSWORD || 'password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
  });

  test('should upload resume', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Create test PDF
    const testPdf = new Blob(['test resume content'], { type: 'application/pdf' });
    
    // Set up file input handler
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.click('text=Upload Resume')
    ]);
    
    await fileChooser.setFiles({
      name: 'test-resume.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from(await testPdf.arrayBuffer())
    });

    await expect(page.getByText('Resume uploaded successfully')).toBeVisible();
  });

  test('should parse resume content', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('Skills')).toBeVisible();
    await expect(page.getByText('Experience')).toBeVisible();
    await expect(page.getByText('Education')).toBeVisible();
  });
});