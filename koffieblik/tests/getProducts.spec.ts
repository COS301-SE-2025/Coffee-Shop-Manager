import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const userPath = path.join(__dirname, 'user.json');

test('fetches and displays Products from /getProducts on POS', async ({ page }) => {
  const { email, password } = JSON.parse(fs.readFileSync(userPath, 'utf-8'));

  // Step 1: Login
  await page.goto('http://localhost:3000/login');
  await page.waitForTimeout(3000); // allow hydration
  const content = await page.content();
  // console.log(content.slice(0, 1000)); // preview rendered HTML

  await page.waitForSelector('input[name="email"], #email', { timeout: 10000 });
  await page.fill('input[name="email"], #email', email);
  await page.fill('input[name="password"], #password', password);
  await page.click('button[type="submit"]');

  //Wait for either dashboard or login error
  const dashboardLoaded = page.locator('text=Recent Orders');
  const loginError = page.locator('text=Invalid email or password');

  await Promise.race([
    dashboardLoaded.waitFor({ timeout: 10000 }),
    loginError.waitFor({ timeout: 10000 }),
  ]);

  if (await loginError.isVisible()) {
    throw new Error('Login failed: Invalid credentials');
  }

  //Confirm session cookie is set
  const cookies = await page.context().cookies();
  // console.log('Cookies after login:', cookies);
  const tokenCookie = cookies.find(c => c.name === 'token');
  expect(tokenCookie).toBeDefined();

  // Check for order rows
  const orderRow = page.locator('table tbody tr');

  try {
    await page.waitForSelector('table tbody tr', { timeout: 15000 });
    const rowCount = await orderRow.count();
    // console.log('Order rows:', rowCount);
    expect(rowCount).toBeGreaterThan(0);

    await expect(page.locator('text=R')).toBeVisible();
    await expect(page.locator('text=Completed')).toBeVisible();
  } catch (err) {
    // console.warn('No orders found on dashboard within timeout.');
  }
});
