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


test('clicks and orders a product, then checks it on the dashboard', async ({ page }) => {
    await login(page);

    // Go to POS
    await page.locator('text=Order Here').click();
    await page.waitForURL('**/userPOS', { timeout: 10000 });

    // Product cards: each has a <h3> with product name
    const productCards = page.locator('div.bg-white >> h3');
    await expect(productCards.first()).toBeVisible({ timeout: 10000 });
    expect(await productCards.count()).toBeGreaterThan(0);

    // Click "Add to Cart" on the first product
    const firstAddButton = page.locator('button:has-text("Add to Cart")').first();
    await firstAddButton.click();

    // Check that the cart badge increased
    const cartBadge = page.locator('header .relative span').nth(1);
    await expect(cartBadge).toHaveText('1');

    // Place the order
    await page.locator('button:has-text("Place Order")').click();

    // Confirm success message
    await expect(page.locator('text=Order Placed Successfully!')).toBeVisible({ timeout: 10000 });

    // Navigate to dashboard
    await page.locator('button:has-text("View Dashboard")').click();
    await page.waitForURL('**/userdashboard', { timeout: 10000 });

    await page.locator('text=View Orders').click();

    // Verify order appears in dashboard (simplified — adjust for your UI)
    const orderRow = page.locator('table tbody tr').first();
    await expect(orderRow).toContainText(/pending/i);


});


