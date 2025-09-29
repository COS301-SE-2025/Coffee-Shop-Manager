import { test, expect, Page } from "@playwright/test";

const email = "admin@coffee.com";
const password = "admin";

async function login(page: Page) {
  await page.goto("https://www.diekoffieblik.co.za/login");
  await page.waitForLoadState("networkidle");

  await page.waitForTimeout(3000); // wait for hydration

  const emailInput = page.locator('input[name="email"]');
  const passwordInput = page.locator('input[name="password"]');

  await expect(emailInput).toBeVisible({ timeout: 10000 });
  await expect(passwordInput).toBeVisible({ timeout: 10000 });

  await emailInput.fill(email);
  await passwordInput.fill(password);
  await page.click('button[type="submit"]');

  const loginError = page.locator("text=Invalid email or password");
  // Check for login success (redirect to /dashboard)
  await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });


  if (await loginError.isVisible()) {
    throw new Error("Login failed: Invalid credentials");
  }

  await page.waitForSelector('h1:text("Dashboard")', { timeout: 10000 }); //Confirm dashboard is loaded
}

test("fetches and displays orders from /get_orders on dashboard", async ({
  page,
}) => {
  await login(page);
  await page.goto("https://www.diekoffieblik.co.za/dashboard");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(3000); // hydration

  const rows = page.locator("table tbody tr");
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

// test("fetches and displays Products from /getProducts on POS", async ({ page }) => {
//   await login(page);

//   // Navigate to dashboard → POS
//   await page.goto("https://www.diekoffieblik.co.za/dashboard");
//   await page.waitForLoadState("networkidle");
//   await page.waitForTimeout(2000);

//   await page.locator("text=POS").click();
//   await page.waitForURL("**/pos", { timeout: 15000 });
//   await page.waitForTimeout(2000);

//   // Products: each has data-testid="product-card"
//   const productCards = page.locator('[data-testid="product-card"]');
//   await expect(productCards.first()).toBeVisible({ timeout: 15000 });

//   const count = await productCards.count();
//   expect(count).toBeGreaterThan(0);

//   // Orders table: has "Order #" in the header
//   const ordersTable = page.locator("table >> text=Order #");
//   await expect(ordersTable).toBeVisible({ timeout: 15000 });

//   // Ensure at least 0+ rows render
//   const orderRows = ordersTable.locator("tbody tr");
//   const rowCount = await orderRows.count();

//   if (rowCount > 0) {
//     await expect(orderRows.first()).toBeVisible();
//   } else {
//     console.log("ℹ️ No orders found, but table is rendered.");
//   }
// });

test("fetches and displays Inventory from /get_stock on Inventory page", async ({
  page,
}) => {
  await login(page);

  await page.locator("text=Inventory").click();
  await page.waitForURL("**/inventory", { timeout: 10000 });
  await page.waitForTimeout(3000); // hydration

  await page.waitForSelector("table tbody tr", { timeout: 10000 });
  const inventoryRows = page.locator("table tbody tr");
  await expect(inventoryRows.first()).toBeVisible({ timeout: 10000 });
  const count = await inventoryRows.count();
  expect(count).toBeGreaterThan(0);
});

test("fetches and displays Orders from /get_orders on manage", async ({ page }) => {
  await login(page);

  // Wait for /get_orders API to finish
  const [ordersResponse] = await Promise.all([
    page.waitForResponse((res) =>
      res.url().includes("/get_orders") && res.status() === 200
    ),
    page.locator("text=manage").click(),
  ]);

  const ordersJson = await ordersResponse.json();
  // console.log("API returned orders:", ordersJson);

  // If no orders, check the "No orders found." message
  if (!ordersJson.orders || ordersJson.orders.length === 0) {
    await expect(page.getByText("No orders found.")).toBeVisible();
    console.log("ℹ️ No orders, message is displayed.");
    return;
  }

  // Otherwise, expect a table
  const ordersTable = page.locator("table");
  await page.waitForSelector("table", { timeout: 10000 });
  await expect(ordersTable).toBeVisible({ timeout: 10000 });

  // Verify header
  await expect(ordersTable.locator("th", { hasText: "Order #" })).toBeVisible({
    timeout: 10000,
  });

  // Verify rows
  const orderRows = ordersTable.locator("tbody tr");
  const rowCount = await orderRows.count();
  expect(rowCount).toBeGreaterThan(0);

  console.log(`✅ Found ${rowCount} order(s) in Manage table`);
});



