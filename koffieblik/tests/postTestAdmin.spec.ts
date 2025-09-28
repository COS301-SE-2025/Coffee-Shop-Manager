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

  await page.goto("http://localhost:3000/pos");
  await page.waitForLoadState("networkidle");

  const productCards = page.getByTestId("product-card");
  await expect(productCards.first()).toBeVisible({ timeout: 20000 });

  const productName = await productCards.first().locator("h2").innerText();
  console.log("Ordering product:", productName);

  await productCards.first().click();
  await expect(page.getByText(/Total:\s*R\d+/)).toBeVisible();

  await page.getByRole("button", { name: /Complete Order/i }).click();
  await expect(page.getByText("✅ Order successfully submitted!")).toBeVisible();

  const posTable = page.getByRole("table");

  const matchingRow = posTable.locator("tbody tr").filter({
    hasText: new RegExp(`${productName}.*pending`, "i"),
  });

  await expect(matchingRow.first()).toBeVisible({ timeout: 20000 });
});

test("orders the second product and completes it via row-level button", async ({ page }) => {
  await login(page);

  // Go to POS
  await page.goto("http://localhost:3000/pos");
  await page.waitForLoadState("networkidle");

  // Wait for product cards
  const productCards = page.getByTestId("product-card");
  const count = await productCards.count();
  expect(count).toBeGreaterThanOrEqual(2);

  const productName = await productCards.nth(1).locator("h2").innerText();
  console.log("Ordering product:", productName);

  await productCards.nth(1).click();
  await expect(page.getByText(/Total:\s*R\d+/)).toBeVisible();

  await page.getByRole("button", { name: /Complete Order/i }).click();
  await expect(page.getByText("✅ Order successfully submitted!")).toBeVisible();

  const posTable = page.getByRole("table");

  const orderRow = posTable.locator("tr", { hasText: new RegExp(productName, "i") });
  await expect(orderRow).toBeVisible({ timeout: 20000 });

  await expect(orderRow).toContainText(/pending/i);

  const completeBtn = orderRow.getByRole("button", { name: "✅ Complete" });
  await completeBtn.click();

  await expect(orderRow).toContainText(/completed/i, { timeout: 20000 });
  await page.waitForTimeout(6000); // wait 6 seconds


  await page.getByRole("button", { name: "completed" }).click();

  const completedRow = posTable.locator("tr", { hasText: new RegExp(productName, "i") });
  await expect(completedRow).toBeVisible({ timeout: 20000 });
  await expect(completedRow).toContainText(/completed/i);
});

test("orders the second product and cancel it via row-level button", async ({ page }) => {
  await login(page);

  // Go to POS
  await page.goto("http://localhost:3000/pos");
  await page.waitForLoadState("networkidle");

  // Wait for product cards
  const productCards = page.getByTestId("product-card");
  const count = await productCards.count();
  expect(count).toBeGreaterThanOrEqual(2);

  // Pick the second product
  const productName = await productCards.nth(1).locator("h2").innerText();
  console.log("Ordering product:", productName);

  await productCards.nth(1).click();
  await expect(page.getByText(/Total:\s*R\d+/)).toBeVisible();

  await page.getByRole("button", { name: /Complete Order/i }).click();
  await expect(page.getByText("✅ Order successfully submitted!")).toBeVisible();

  const posTable = page.getByRole("table");

  const orderRow = posTable.locator("tr", { hasText: new RegExp(productName, "i") });
  await expect(orderRow).toBeVisible({ timeout: 20000 });

  await expect(orderRow).toContainText(/pending/i);

  const cancelBtn = orderRow.getByRole("button", { name: "❌ Cancel" });
  await cancelBtn.click();

  await expect(orderRow).toContainText(/cancelled/i, { timeout: 20000 });
  await page.waitForTimeout(6000); // wait 6 seconds


  await page.getByRole("button", { name: "cancelled" }).click();

  const completedRow = posTable.locator("tr", { hasText: new RegExp(productName, "i") });
  await expect(completedRow).toBeVisible({ timeout: 20000 });
  await expect(completedRow).toContainText(/cancelled/i);
});




test("orders second and third product, completes it, and verifies in manage", async ({ page }) => {
  await login(page);

  // Go to POS
  await page.goto("http://localhost:3000/pos");
  await page.waitForLoadState("networkidle");

  const productCards = page.getByTestId("product-card");
  expect(await productCards.count()).toBeGreaterThanOrEqual(3);

  // Add 2 products
  await productCards.nth(1).click();
  await productCards.nth(2).click();
  await page.getByRole("button", { name: /Complete Order/i }).click();
  await expect(page.getByText("✅ Order successfully submitted!")).toBeVisible();

  const posTable = page.getByRole("table");
  const latestRow = posTable.locator("tbody tr").first();

  // Extract the order number
  const orderNumberText = await latestRow.locator("td").first().innerText();
  const orderNumber = orderNumberText.replace("#", "").trim();
  console.log("🆕 Created order number:", orderNumber);

  const completeBtn = latestRow.getByRole("button", { name: "✅ Complete" });
  await completeBtn.click();
  await expect(latestRow).toContainText(/completed/i);

  // --- Go to Manage page ---
  await page.goto("http://localhost:3000/manage");
  await page.waitForLoadState("networkidle");

  await page.getByRole("button", { name: "completed" }).click();

  const manageTable = page.getByRole("table");
  const completedRow = manageTable.locator("tr", { hasText: `#${orderNumber}` });

  await expect(completedRow).toBeVisible({ timeout: 20000 });
  await expect(completedRow).toContainText(/completed/i);
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
