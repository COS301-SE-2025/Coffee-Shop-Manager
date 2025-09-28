import { test, expect, Page } from "@playwright/test";

const email = "admin@coffee.com";
const password = "admin";

async function login(page: Page) {
  await page.goto("http://localhost:3000/login");
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
  await Promise.race([
    page.waitForURL("**/dashboard", { timeout: 10000 }),
    loginError.waitFor({ timeout: 10000 }),
  ]);

  if (await loginError.isVisible()) {
    throw new Error("Login failed: Invalid credentials");
  }

  await page.waitForSelector('h1:text("Dashboard")', { timeout: 10000 }); //Confirm dashboard is loaded
}

// test("fetches and displays orders from /get_orders on dashboard", async ({
//   page,
// }) => {
//   await login(page);
//   await page.goto("http://localhost:3000/dashboard");
//   await page.waitForLoadState("networkidle");
//   await page.waitForTimeout(3000); // hydration

//   const rows = page.locator("table tbody tr");
//   const rowCount = await rows.count();

//   //   console.log(`Found ${rowCount} orders in table`);

//   if (rowCount === 0) {
//     // console.warn('No orders found – possibly a fresh database or user.');
//     expect(rowCount).toBe(0); // Passes test intentionally
//   } else {
//     await expect(rows.first()).toBeVisible({ timeout: 10000 });
//     expect(rowCount).toBeGreaterThan(0);
//   }
// });

test("fetches and displays Products from /getProducts on POS", async ({
  page,
}) => {
  await login(page);

  await page.goto("http://localhost:3000/dashboard");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(3000); // hydration

  await page.locator("text=POS").click();
  await page.waitForURL("**/pos", { timeout: 15000 });
  await page.waitForTimeout(3000); // hydration

  const productCards = page.locator("button:has(h2)"); // Adjusted for POS buttons
  await expect(productCards.first()).toBeVisible({ timeout: 15000 });
  const count = await productCards.count();
  expect(count).toBeGreaterThan(0);

  const ordersTable = page.locator("table:has-text('Order #')");
  await expect(ordersTable).toBeVisible({ timeout: 15000 });

  // Optionally also check at least one row exists
  const orderRows = ordersTable.locator("tbody tr");
  const rowCount = await orderRows.count();

  if (rowCount > 0) {
    // Optional: check that at least the first row renders expected data
    await expect(orderRows.first()).toBeVisible();
  } else {
    console.log("ℹ️ No orders found, but table is rendered.");
  }
});

test("orders a product and checks it appears in POS orders table", async ({ page }) => {
  await login(page);

  // Go straight to POS
  await page.goto("http://localhost:3000/pos");
  await page.waitForLoadState("networkidle");

  // Wait for products
  const productCards = page.getByTestId("product-card");
  await expect(productCards.first()).toBeVisible({ timeout: 20000 });

  // Pick product
  const productName = await productCards.first().locator("h2").innerText();
  console.log("Ordering product:", productName);

  // Add to cart
  await productCards.first().click();
  await expect(page.getByText(/Total:\s*R\d+/)).toBeVisible();

  // Complete order
  await page.getByRole("button", { name: /Complete Order/i }).click();
  await expect(page.getByText("✅ Order successfully submitted!")).toBeVisible();

  // --- Orders table ---
  const posTable = page.getByRole("table");

  // Wait until *any* row in the table contains the product name
  await expect(posTable).toContainText(productName, { timeout: 20000 });

  // Also check it has "pending" status somewhere in the same table
  await expect(posTable).toContainText(/pending/i);
});


// test("fetches and displays Inventory from /get_stock on Inventory page", async ({
//   page,
// }) => {
//   await login(page);

//   await page.locator("text=Inventory").click();
//   await page.waitForURL("**/inventory", { timeout: 10000 });
//   await page.waitForTimeout(3000); // hydration

//   await page.waitForSelector("table tbody tr", { timeout: 10000 });
//   const inventoryRows = page.locator("table tbody tr");
//   await expect(inventoryRows.first()).toBeVisible({ timeout: 10000 });
//   const count = await inventoryRows.count();
//   expect(count).toBeGreaterThan(0);
// });

// test("fetches and displays Orders from /get_orders on manage", async ({
//   page,
// }) => {
//   await login(page);

//   await page.locator("text=manage").click();
//   await page.waitForURL("**/manage", { timeout: 15000 });
//   await page.waitForTimeout(3000); // hydration


//   const ordersTable = page.locator("table:has-text('Order #')");
//   await expect(ordersTable).toBeVisible({ timeout: 15000 });

//   // Optionally also check at least one row exists
//   const orderRows = ordersTable.locator("tbody tr");
//   const rowCount = await orderRows.count();

//   if (rowCount > 0) {
//     // Optional: check that at least the first row renders expected data
//     await expect(orderRows.first()).toBeVisible();
//   } else {
//     console.log("ℹ️ No orders found, but table is rendered.");
//   }
// });
