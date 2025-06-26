import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const userPath = path.join(__dirname, 'user.json');

test('fetches and displays Products from /getProducts on POS', async ({ page }) => {
  const { email, password } = JSON.parse(fs.readFileSync(userPath, 'utf-8'));

  // Step 1: Login
  await page.goto('http://localhost:3000/login');
  await page.waitForSelector('input[name="email"]', { timeout: 10000 });
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');

  const loginError = page.locator('text=Invalid email or password');

  // Wait for dashboard or error
  await Promise.race([
    page.waitForURL('**/dashboard', { timeout: 10000 }),
    loginError.waitFor({ timeout: 10000 }),
  ]);

  if (await loginError.isVisible()) {
    throw new Error('❌ Login failed: Invalid credentials');
  }

  // Step 2: Navigate to POS
  const posLink = page.locator('a[href="/pos"]');
  await posLink.waitFor({ timeout: 10000 });
  await posLink.click();
  await page.waitForURL('**/pos', { timeout: 10000 });

  // Step 3: Wait for product cards or table
  const productSection = page.locator('text=Products').first();
  await expect(productSection).toBeVisible({ timeout: 10000 });

  // Example check for actual product display (adapt if using cards/grid)
  const productName = page.locator('text=Cappuccino'); // Use a real product name if dynamic
  await expect(productName).toBeVisible({ timeout: 10000 });
});
