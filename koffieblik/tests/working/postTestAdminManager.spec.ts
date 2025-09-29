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


test("fetches and displays Products from /getProducts on POS", async ({ page }) => {
    await login(page);

    // Navigate to dashboard → POS
    await page.goto("http://localhost:3000/dashboard");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    await page.locator("text=POS").click();
    await page.waitForURL("**/pos", { timeout: 15000 });
    await page.waitForTimeout(2000);

    // Products: each has data-testid="product-card"
    const productCards = page.locator('[data-testid="product-card"]');
    await expect(productCards.first()).toBeVisible({ timeout: 15000 });

    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);

    // Orders table: has "Order #" in the header
    const ordersTable = page.locator("table >> text=Order #");
    await expect(ordersTable).toBeVisible({ timeout: 15000 });

    // Ensure at least 0+ rows render
    const orderRows = ordersTable.locator("tbody tr");
    const rowCount = await orderRows.count();

    if (rowCount > 0) {
        await expect(orderRows.first()).toBeVisible();
    } else {
        console.log("ℹ️ No orders found, but table is rendered.");
    }
});




test("orders a product and checks it appears in POS and Manage orders tables complete it", async ({ page }) => {
    await login(page);

    // Go to POS
    await page.goto("http://localhost:3000/pos");
    await page.waitForLoadState("networkidle");

    // Grab product cards
    const productCards = page.getByTestId("product-card");
    await expect(productCards.first()).toBeVisible({ timeout: 20000 });

    // Add product to cart
    await productCards.first().click();
    await expect(page.getByText(/Total:\s*R\d+/)).toBeVisible();

    // Submit order
    await page.getByRole("button", { name: /Complete Order/i }).click();

    // Find the new order row in POS table
    const posTable = page.getByRole("table");
    const orderRows = posTable.locator("tbody tr");

    const pendingRow = orderRows.filter({
        has: page.locator("td span", { hasText: /pending/i }),
    });

    await expect(pendingRow.first()).toBeVisible({ timeout: 20000 });

    // Extract the order number (first cell in the row, e.g. "#123")
    const orderNumber = await pendingRow.first().locator("td").first().innerText();
    console.log("Captured order number:", orderNumber);

    // 🔑 Now go to Manage page
    await page.goto("http://localhost:3000/manage");
    await page.waitForLoadState("networkidle");

    const manageTable = page.getByRole("table");
    const manageRows = manageTable.locator("tbody tr");

    // Look for the same order number in Manage
    const manageRow = manageRows.filter({
        has: page.locator("td", { hasText: orderNumber }),
    });

    await expect(manageRow.first()).toBeVisible({ timeout: 20000 });

    const completeBtn = manageRow.first().getByRole("button", { name: /.*Complete/i });

    await expect(completeBtn).toBeVisible({ timeout: 10000 });
    await completeBtn.click();

    // Verify the status cell updates to "completed"
    const completedRow = manageRows.filter({
        has: page.locator("td", { hasText: orderNumber }),
    }).filter({
        has: page.locator("td span", { hasText: /completed/i }),
    });

    await expect(completedRow.first()).toBeVisible({ timeout: 20000 });
});



test("orders a product and checks it appears in POS and Manage orders tables cancel it", async ({ page }) => {
    await login(page);

    // Go to POS
    await page.goto("http://localhost:3000/pos");
    await page.waitForLoadState("networkidle");

    // Grab product cards
    const productCards = page.getByTestId("product-card");
    await expect(productCards.first()).toBeVisible({ timeout: 20000 });

    // Add product to cart
    await productCards.first().click();
    await expect(page.getByText(/Total:\s*R\d+/)).toBeVisible();

    // Submit order
    await page.getByRole("button", { name: /Complete Order/i }).click();

    // Find the new order row in POS table
    const posTable = page.getByRole("table");
    const orderRows = posTable.locator("tbody tr");

    const pendingRow = orderRows.filter({
        has: page.locator("td span", { hasText: /pending/i }),
    });

    await expect(pendingRow.first()).toBeVisible({ timeout: 20000 });

    // Extract the order number (first cell in the row, e.g. "#123")
    const orderNumber = await pendingRow.first().locator("td").first().innerText();
    console.log("Captured order number:", orderNumber);

    // 🔑 Now go to Manage page
    await page.goto("http://localhost:3000/manage");
    await page.waitForLoadState("networkidle");

    const manageTable = page.getByRole("table");
    const manageRows = manageTable.locator("tbody tr");

    // Look for the same order number in Manage
    const manageRow = manageRows.filter({
        has: page.locator("td", { hasText: orderNumber }),
    });

    await expect(manageRow.first()).toBeVisible({ timeout: 20000 });

    const completeBtn = manageRow.first().getByRole("button", { name: /.*Cancel/i });

    await expect(completeBtn).toBeVisible({ timeout: 10000 });
    await completeBtn.click();

    // Verify the status cell updates to "completed"
    const completedRow = manageRows.filter({
        has: page.locator("td", { hasText: orderNumber }),
    }).filter({
        has: page.locator("td span", { hasText: /cancelled/i }),
    });

    await expect(completedRow.first()).toBeVisible({ timeout: 20000 });
});






// test("orders a product, verifies it in POS table, and marks it completed", async ({ page }) => {
//   await login(page);

//   await page.goto("http://localhost:3000/pos");
//   await page.waitForLoadState("networkidle");

//   // Grab product cards
//   const productCards = page.getByTestId("product-card");
//   await expect(productCards.first()).toBeVisible({ timeout: 20000 });

//   // Get product name (h3 now, not h2)
//   const productName = await productCards.first().locator("h3").innerText();
//   console.log("Ordering product:", productName);

//   // Add to cart
//   await productCards.first().click();
//   await expect(page.getByText(/Total:\s*R\d+/)).toBeVisible();

//   // Submit order
//   await page.getByRole("button", { name: /Complete Order/i }).click();

//   // Find the order row with product name and pending status
//   const posTable = page.getByRole("table");
//   const orderRows = posTable.locator("tbody tr");

//   const pendingRow = orderRows.filter({
//     has: page.locator("td", { hasText: productName }),
//   }).filter({
//     has: page.locator("td span", { hasText: /pending/i }),
//   });

//   await expect(pendingRow.first()).toBeVisible({ timeout: 20000 });

//   // Click the row's "Complete" button
//   const completeBtn = pendingRow.first().getByRole("button", { name: /Complete/i });
//   await expect(completeBtn).toBeVisible({ timeout: 10000 });
//   await completeBtn.click();

//   // Verify the row updates to completed
//   const completedRow = orderRows.filter({
//     has: page.locator("td", { hasText: productName }),
//   }).filter({
//     has: page.locator("td span", { hasText: /completed/i }),
//   });

//   await expect(completedRow.first()).toBeVisible({ timeout: 20000 });

//   await page.waitForTimeout(6000); // wait 6 seconds
//   // 🔑 Switch
//   await page.getByRole("button", { name: /Completed/i }).click();


//   const completedFilteredRow = posTable.locator("tbody tr").filter({
//     has: page.locator("td", { hasText: productName }),
//   }).filter({
//     has: page.locator("td span", { hasText: /completed/i }),
//   });
//   await expect(completedFilteredRow.first()).toBeVisible({ timeout: 20000 });
// });

// test("orders a product, verifies it in POS table, and marks it cancelled", async ({ page }) => {
//   await login(page);

//   await page.goto("http://localhost:3000/pos");
//   await page.waitForLoadState("networkidle");

//   // Grab product cards
//   const productCards = page.getByTestId("product-card");
//   await expect(productCards.first()).toBeVisible({ timeout: 20000 });

//   // Get product name (h3 now, not h2)
//   const productName = await productCards.first().locator("h3").innerText();
//   console.log("Ordering product:", productName);

//   // Add to cart
//   await productCards.first().click();
//   await expect(page.getByText(/Total:\s*R\d+/)).toBeVisible();

//   // Submit order
//   await page.getByRole("button", { name: /Complete Order/i }).click();

//   // Find the order row with product name and pending status
//   const posTable = page.getByRole("table");
//   const orderRows = posTable.locator("tbody tr");

//   const pendingRow = orderRows.filter({
//     has: page.locator("td", { hasText: productName }),
//   }).filter({
//     has: page.locator("td span", { hasText: /pending/i }),
//   });

//   await expect(pendingRow.first()).toBeVisible({ timeout: 20000 });

//   // Click the row's "Cancel" button
//   const cancelBtn = pendingRow.first().getByRole("button", { name: /Cancel/i });
//   await expect(cancelBtn).toBeVisible({ timeout: 10000 });
//   await cancelBtn.click();

//   // Verify the row updates to cancelled
//   const cancelledRow = orderRows.filter({
//     has: page.locator("td", { hasText: productName }),
//   }).filter({
//     has: page.locator("td span", { hasText: /cancelled/i }),
//   });

//   await expect(cancelledRow.first()).toBeVisible({ timeout: 20000 });

//   await page.waitForTimeout(6000); // wait 6 seconds
//   // 🔑 Switch to the Cancelled filter tab
//   await page.getByRole("button", { name: /cancelled/i }).click();

//   // Confirm the cancelled row is still visible in this filter view
//   const cancelledFilteredRow = posTable.locator("tbody tr").filter({
//     has: page.locator("td", { hasText: productName }),
//   }).filter({
//     has: page.locator("td span", { hasText: /cancelled/i }),
//   });
//   await expect(cancelledFilteredRow.first()).toBeVisible({ timeout: 20000 });
// });




