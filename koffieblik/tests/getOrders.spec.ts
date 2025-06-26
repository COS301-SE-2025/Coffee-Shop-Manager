import { test, expect } from '@playwright/test';

test('fetches and displays orders from /get_orders on dashboard', async ({ page }) => {
  const email = 'test@example.com';
  const password = 'P@ssword123';

  // Step 1: Visit login page and wait for input
  await page.goto('http://localhost:3000/login');
  await page.waitForSelector('#email', { timeout: 15000 });

  await page.fill('#email', email);
  await page.fill('#password', password);
  await page.click('button[type="submit"]');

  // Step 2: Wait for navigation or login error
  const loginError = page.locator('text=Invalid email or password');
  await Promise.race([
    page.waitForURL('**/dashboard', { timeout: 10000 }),
    loginError.waitFor({ timeout: 10000 }),
  ]);

  if (await loginError.isVisible()) {
    throw new Error('❌ Login failed: Invalid credentials');
  }

  // Step 3: Wait for dashboard content to load
  await page.waitForSelector('text=Recent Orders', { timeout: 10000 });

  // Step 4: Validate orders table
  const rows = page.locator('table tbody tr');
  await expect(rows.first()).toBeVisible({ timeout: 10000 });

  const count = await rows.count();
  expect(count).toBeGreaterThan(0);
});
