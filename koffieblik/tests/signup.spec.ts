import { test, expect } from '@playwright/test';

test('signs up a new user', async ({ page }) => {
  await page.goto('http://localhost:3000/signup');

  const uniqueSuffix = Date.now();
  await page.fill('input#username', `TestUser${uniqueSuffix}`);
  await page.fill('input#email', `test${uniqueSuffix}@example.com`);
  await page.fill('input#password', 'StrongP@ssw0rd');

  await page.click('button[type="submit"]');

  // Wait for client-side routing to /login
  await page.waitForURL('**/login', { timeout: 10000 });

  // Confirm we’re on the login page
  await expect(page).toHaveURL(/.*\/login/);
});
