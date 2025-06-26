import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const userPath = path.join(__dirname, 'user.json');

// Test 1: Sign up a new user
test('signs up a new user', async ({ page }) => {
  const uniqueSuffix = Date.now();
  const email = `test${uniqueSuffix}@example.com`;
  const username = `TestUser${uniqueSuffix}`;
  const password = 'StrongP@ssw0rd';

  // Save user data for reuse
  fs.writeFileSync(userPath, JSON.stringify({ email, username, password }, null, 2));

  await page.goto('http://localhost:3000/signup');
  await page.fill('input#username', username);
  await page.fill('input#email', email);
  await page.fill('input#password', password);
  await page.fill('input#confirm-password', password); 
  await page.click('button[type="submit"]');

  // Wait for client-side navigation to login
  await page.waitForURL('**/login', { timeout: 10000 });
  await expect(page).toHaveURL(/.*\/login/);
});

// Test 2: Attempt to register the same user again
test('fails to register duplicate user', async ({ page }) => {
  const { email, username, password } = JSON.parse(fs.readFileSync(userPath, 'utf-8'));

  await page.goto('http://localhost:3000/signup');
  await page.waitForSelector('input#username'); // ✅ wait for form to render

  await page.fill('input#username', username);
  await page.fill('input#email', email);
  await page.fill('input#password', password);
  await page.fill('input#confirm-password', password);
  await page.click('button[type="submit"]');

  // Wait for the error to appear
  const errorLocator = page.locator('text=User already registered');
  await expect(errorLocator).toBeVisible({ timeout: 5000 });
});

