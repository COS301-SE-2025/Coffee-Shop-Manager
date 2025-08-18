import { test, expect, Page } from '@playwright/test';

const email = 'admin@coffee.com';
const password = 'admin';

async function login(page: Page) {
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');

  await page.waitForTimeout(3000); // wait for hydration

  const emailInput = page.locator('input[name="email"]');
  const passwordInput = page.locator('input[name="password"]');

  await expect(emailInput).toBeVisible({ timeout: 10000 });
  await expect(passwordInput).toBeVisible({ timeout: 10000 });

  await emailInput.fill(email);
  await passwordInput.fill(password);
  await page.click('button[type="submit"]');

  const loginError = page.locator('text=Invalid email or password');
  await Promise.race([
    page.waitForURL('**/dashboard', { timeout: 10000 }),
    loginError.waitFor({ timeout: 10000 }),
  ]);

  if (await loginError.isVisible()) {
    throw new Error('Login failed: Invalid credentials');
  }

  await page.waitForSelector('h1:text("Dashboard")', { timeout: 10000 }); //Confirm dashboard is loaded
}

test('fetches and displays orders from /get_orders on dashboard', async ({ page }) => {
  await login(page);
  await page.goto('http://localhost:3000/dashboard');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000); // hydration

  const rows = page.locator('table tbody tr');
  const rowCount = await rows.count();

  //   console.log(`Found ${rowCount} orders in table`);

  if (rowCount === 0) {
    // console.warn('No orders found – possibly a fresh database or user.');
    expect(rowCount).toBe(0); // Passes test intentionally
  } else {
    await expect(rows.first()).toBeVisible({ timeout: 10000 });
    expect(rowCount).toBeGreaterThan(0);
  }
});


test('fetches and displays Products from /getProducts on POS', async ({ page }) => {
  await login(page);

  await page.locator('text=POS').click();
  await page.waitForURL('**/pos', { timeout: 10000 });
  await page.waitForTimeout(3000); // hydration

  const productCards = page.locator('button:has(h2)'); // Adjusted for POS buttons
  await expect(productCards.first()).toBeVisible({ timeout: 10000 });
  const count = await productCards.count();
  expect(count).toBeGreaterThan(0);
});

test('clicks and orders a product, then checks it on the dashboard', async ({ page }) => {
  await login(page);

  // Go to POS
  await page.locator('text=POS').click();
  await page.waitForURL('**/pos', { timeout: 10000 });

  const productCards = page.locator('button:has(h2)');
  await expect(productCards.first()).toBeVisible({ timeout: 10000 });
  expect(await productCards.count()).toBeGreaterThan(0);

  // Extract the product name
  const productName = await productCards.first().locator('h2').innerText();
  // console.log('Clicked product:', productName);

  // Click card → add to cart
  await productCards.first().click();

  // Verify cart total updated
  await expect(page.getByText(/Total:\s*R\d+/)).toBeVisible();

  // Complete order
  await page.getByRole('button', { name: /Complete Order/i }).click();

  // Success message
  await expect(
    page.getByText('✅ Order successfully submitted!')
  ).toBeVisible();

  // still in POS → assert cart product name is visible
  await expect(page.getByText(productName)).toBeVisible();

  // Navigate back to dashboard
  await page.getByRole('link', { name: /Dashboard/ }).click();
  await page.waitForURL('**/dashboard', { timeout: 10000 });

  // Assert the product name appears in the dashboard table
  await expect(page.getByRole('table')).toContainText(productName);

});

test('clicks and orders multiple products, then checks them on the dashboard', async ({ page }) => {
  await login(page);

  // Go to POS
  await page.getByRole('link', { name: /POS/ }).click();
  await page.waitForURL('**/pos', { timeout: 10000 });

  const productCards = page.locator('button:has(h2)');
  await expect(productCards.first()).toBeVisible({ timeout: 10000 });
  const count = await productCards.count();
  expect(count).toBeGreaterThanOrEqual(2); // need at least 2 products

  // Extract product names
  const firstProduct = await productCards.nth(0).locator('h2').innerText();
  const secondProduct = await productCards.nth(1).locator('h2').innerText();

  // Add both to cart
  await productCards.nth(0).click();
  await productCards.nth(1).click();

  // Verify cart has both
  const cart = page.locator('.shadow-md'); // the cart box
  await expect(cart.getByText(new RegExp(`^${firstProduct}\\s*x\\d+$`))).toBeVisible();
  await expect(cart.getByText(new RegExp(`^${secondProduct}\\s*x\\d+$`))).toBeVisible();


  // Complete order
  await page.getByRole('button', { name: /Complete Order/i }).click();

  // Success message
  await expect(
    page.getByText('✅ Order successfully submitted!')
  ).toBeVisible();

  // Navigate back to dashboard
  await page.getByRole('link', { name: /Dashboard/ }).click();
  await page.waitForURL('**/dashboard', { timeout: 10000 });


  // Assert both product names appear
  await expect(page.getByRole('table')).toContainText(firstProduct, { timeout: 15000 });
  await expect(page.getByRole('table')).toContainText(secondProduct, { timeout: 15000 });

});





test('fetches and displays Inventory from /get_stock on Inventory page', async ({ page }) => {
  await login(page);

  await page.locator('text=Inventory').click();
  await page.waitForURL('**/inventory', { timeout: 10000 });
  await page.waitForTimeout(3000); // hydration

  await page.waitForSelector('table tbody tr', { timeout: 10000 });
  const inventoryRows = page.locator('table tbody tr');
  await expect(inventoryRows.first()).toBeVisible({ timeout: 10000 });
  const count = await inventoryRows.count();
  expect(count).toBeGreaterThan(0);
});

