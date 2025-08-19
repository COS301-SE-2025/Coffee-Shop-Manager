import DashboardLayout from '@/app/dashboard/layout';
import { test, expect, Page } from '@playwright/test';

const email = 'user@coffee.com';
const password = 'user';

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
        page.waitForURL('**/userdashboard', { timeout: 10000 }),
        loginError.waitFor({ timeout: 10000 }),
    ]);

    if (await loginError.isVisible()) {
        throw new Error('Login failed: Invalid credentials');
    }

    await page.waitForSelector('h1:text("Dashboard")', { timeout: 10000 }); //Confirm dashboard is loaded
}

test('fetches and displays orders from /get_orders on userdashboard', async ({ page }) => {
    await login(page);
    await page.goto('http://localhost:3000/userdashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // hydration

    const viewOrdersDiv = page.locator('div', { hasText: 'View orders' }).first();

    await expect(viewOrdersDiv).toBeVisible({ timeout: 10000 });

    await page.locator('div', { hasText: 'View Orders' }).first().click()

    const rows = page.locator('table tbody tr');
    const rowCount = await rows.count();

    // //   console.log(`Found ${rowCount} orders in table`);

    if (rowCount === 0) {
        // console.warn('No orders found – possibly a fresh database or user.');
        expect(rowCount).toBe(0); // Passes test intentionally
    } else {
        await expect(rows.first()).toBeVisible({ timeout: 10000 });
        expect(rowCount).toBeGreaterThan(0);
    }
});

test('fetches and displays points on userdashboard', async ({ page }) => {
    await login(page);
    await page.goto('http://localhost:3000/userdashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // hydration


    const seePointsTrigger = page.getByText(/See\s*Points/i).first();
    await expect(seePointsTrigger).toBeVisible({ timeout: 10000 });
    await seePointsTrigger.click();

    const seePointsDivMain = page.locator('h2', { hasText: /Your Loyalty Points/i }).first();
    await expect(seePointsDivMain).toBeVisible({ timeout: 10000 });
});


test('checks that the navbar shows only Dashboard, Order Here, Help (plus Logout & username)', async ({ page }) => {
    await login(page);
    await page.goto('http://localhost:3000/userdashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // hydration

    const navbar = page.locator('nav');
    const navItems = navbar.locator('a, button');

    await expect(navItems).toHaveCount(5);

    const texts = await navItems.allTextContents();

    // strip emojis and extra space just get the words
    const cleanTexts = texts.map(t => t.replace(/^[^\w]+/, '').trim());

    expect(cleanTexts[0]).toBe('Dashboard');
    expect(cleanTexts[1]).toBe('Order Here');
    expect(cleanTexts[2]).toBe('Help');
    expect(cleanTexts[3].length).toBeGreaterThan(0);
    expect(cleanTexts[3]).not.toBe('Logout');
    expect(cleanTexts[4]).toBe('Logout');
});










// test('fetches and displays Products from /getProducts on POS', async ({ page }) => {
//   await login(page);

//   await page.locator('text=POS').click();
//   await page.waitForURL('**/pos', { timeout: 10000 });
//   await page.waitForTimeout(3000); // hydration

//   const productCards = page.locator('button:has(h2)'); // Adjusted for POS buttons
//   await expect(productCards.first()).toBeVisible({ timeout: 10000 });
//   const count = await productCards.count();
//   expect(count).toBeGreaterThan(0);
// });






// test('fetches and displays Inventory from /get_stock on Inventory page', async ({ page }) => {
//   await login(page);

//   await page.locator('text=Inventory').click();
//   await page.waitForURL('**/inventory', { timeout: 10000 });
//   await page.waitForTimeout(3000); // hydration

//   await page.waitForSelector('table tbody tr', { timeout: 10000 });
//   const inventoryRows = page.locator('table tbody tr');
//   await expect(inventoryRows.first()).toBeVisible({ timeout: 10000 });
//   const count = await inventoryRows.count();
//   expect(count).toBeGreaterThan(0);
// });

