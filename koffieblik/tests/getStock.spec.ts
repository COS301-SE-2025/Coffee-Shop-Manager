import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const userPath = path.join(__dirname, 'user.json');

test('fetches and displays Inventory from /get_stock on Inventory page', async ({ page }) => {
  const { email, password } = JSON.parse(fs.readFileSync(userPath, 'utf-8'));

  // Step 1: Login
  await page.goto('http://localhost:3000/login');
  await page.waitForTimeout(3000);

  await page.waitForSelector('input[name="email"], #email', { timeout: 10000 });
  await page.fill('input[name="email"], #email', email);
  await page.fill('input[name="password"], #password', password);
  await page.click('button[type="submit"]');

  const dashboardLoaded = page.locator('text=Recent Orders');
  const loginError = page.locator('text=Invalid email or password');

  await Promise.race([
    dashboardLoaded.waitFor({ timeout: 10000 }),
    loginError.waitFor({ timeout: 10000 }),
  ]);

  if (await loginError.isVisible()) {
    throw new Error('Login failed: Invalid credentials');
  }

  // Confirm session cookie is set
  const cookies = await page.context().cookies();
  const tokenCookie = cookies.find(c => c.name === 'token');
  expect(tokenCookie).toBeDefined();

  // Step 2: Navigate to Inventory
  await page.goto('http://localhost:3000/inventory');

  // Step 3: Wait for inventory page to load
  await page.waitForSelector('text=Inventory Stock', { timeout: 10000 });

  // Step 4: Wait for at least one inventory row
  await page.waitForSelector('table tbody tr', { timeout: 5000 });
  const inventoryRow = page.locator('table tbody tr');
  const count = await inventoryRow.count();
//   console.log('nventory rows found:', count);
  expect(count).toBeGreaterThan(0);

  // Step 5: Confirm key headers are visible
  await expect(page.locator('text=Quantity')).toBeVisible();
  await expect(page.locator('text=Unit')).toBeVisible();
});
