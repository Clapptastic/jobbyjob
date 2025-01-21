import { test, expect } from './test.setup';
import { createMockFile } from '../utils/test-utils';

test.describe('Application Flow', () => {
  test('should handle signup flow', async ({ page, testUser }) => {
    await page.goto('/signup');

    // Fill in signup form
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button[type="submit"]');

    // Should redirect to dashboard after signup
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should handle login flow', async ({ page, testUser, authenticated }) => {
    test.skip(!authenticated, 'Test requires authentication');

    await page.goto('/login');

    // Fill in login form
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button[type="submit"]');

    // Should redirect to dashboard after login
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should handle resume upload', async ({ page, testUser, authenticated, testResume }) => {
    test.skip(!authenticated, 'Test requires authentication');

    await page.goto('/dashboard');

    // Create a mock PDF file
    const file = createMockFile(JSON.stringify(testResume), 'test-resume.pdf');

    // Upload the file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles([file]);

    // Wait for upload success message
    await expect(page.locator('text=Resume uploaded successfully')).toBeVisible();

    // Verify parsed resume data is displayed
    await expect(page.locator('text=' + testResume.basics.name)).toBeVisible();
    await expect(page.locator('text=' + testResume.basics.email)).toBeVisible();

    // Verify skills are displayed
    for (const skill of testResume.skills) {
      await expect(page.locator(`text=${skill.name}`)).toBeVisible();
    }

    // Verify work experience is displayed
    for (const work of testResume.work) {
      await expect(page.locator(`text=${work.company}`)).toBeVisible();
      await expect(page.locator(`text=${work.position}`)).toBeVisible();
    }

    // Verify education is displayed
    for (const edu of testResume.education) {
      await expect(page.locator(`text=${edu.institution}`)).toBeVisible();
      await expect(page.locator(`text=${edu.area}`)).toBeVisible();
    }
  });

  test('should handle job search and application', async ({ page, authenticated }) => {
    test.skip(!authenticated, 'Test requires authentication');

    await page.goto('/jobs');

    // Search for jobs
    await page.fill('input[placeholder="Search jobs"]', 'Software Engineer');
    await page.click('button[type="submit"]');

    // Wait for job results
    await expect(page.locator('.job-listing')).toBeVisible();

    // Click on first job
    await page.click('.job-listing >> nth=0');

    // Apply for job
    await page.click('button:has-text("Apply")');

    // Wait for success message
    await expect(page.locator('text=Application submitted successfully')).toBeVisible();

    // Verify application status
    await page.goto('/applications');
    await expect(page.locator('.application-status')).toBeVisible();
  });

  test('should handle error states', async ({ page }) => {
    // Test invalid login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Invalid credentials')).toBeVisible();

    // Test invalid file upload
    await page.goto('/dashboard');
    const invalidFile = createMockFile('invalid', 'test.txt', 'text/plain');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles([invalidFile]);
    await expect(page.locator('text=Invalid file type')).toBeVisible();
  });
});