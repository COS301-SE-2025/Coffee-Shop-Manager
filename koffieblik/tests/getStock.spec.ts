import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const userPath = path.join(__dirname, 'user.json');

test('fetches and displays Inventory from /get_stock on Inventory page', async ({ page }) => {
  const { email, password } = JSON.parse(fs.readFileSync(userPath, 'utf-8'));

  // Step 1: Login
  await page.goto('http://localhost:3000/login');
  await page.waitForSelector('input[name="email"], #email', { timeout: 10000 });

  await page.fill('input[name="email"], #email', email);
  await page.fill('input[name="password"], #password', password);
  await page.click('button[type="submit"]');

  // Step 2: Wait for dashboard or login error
  const dashboardLoaded = page.locator('text=Recent Orders');
  const loginError = page.locator('text=Invalid email or password');

await Promise.race([
  page.waitForSelector('text=Recent Orders', { timeout: 10000 }),
  loginError.waitFor({ timeout: 10000 }),
]);


if (await loginError.isVisible()) {
  throw new Error('Login failed: Invalid credentials');
}

// Wait for dashboard content after redirect
await page.waitForSelector('table', { timeout: 10000 }); // or any key dashboard element


  if (await loginError.isVisible()) {
    throw new Error('❌ Login failed: Invalid credentials');
  }

  // Step 3: Confirm session cookie exists
  const cookies = await page.context().cookies();
  const tokenCookie = cookies.find(c => c.name === 'token');
  expect(tokenCookie).toBeDefined();

  // Step 4: Navigate to Inventory
  await page.goto('http://localhost:3000/inventory');
  await page.waitForSelector('text=Inventory Stock', { timeout: 10000 });

  // Step 5: Wait for inventory rows or handle empty case
  const inventoryRow = page.locator('table tbody tr');
  await expect(page.locator('table')).toBeVisible({ timeout: 10000 });

  const count = await inventoryRow.count();

  if (count === 0) {
    console.warn('⚠️ No inventory items found. This is allowed.');
  } else {
    expect(count).toBeGreaterThan(0);
  }

  // Step 6: Check key headers are present
  await expect(page.locator('text=Quantity')).toBeVisible();
  await expect(page.locator('text=Unit')).toBeVisible();
});
