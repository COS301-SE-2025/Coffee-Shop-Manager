import { test, expect, Page } from "@playwright/test";

const email = "user@coffee.com";
const password = "user";

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
    page.waitForURL("**/userdashboard", { timeout: 10000 }),
    loginError.waitFor({ timeout: 10000 }),
  ]);

  if (await loginError.isVisible()) {
    throw new Error("Login failed: Invalid credentials");
  }

  await page.waitForSelector('h1:text("Dashboard")', { timeout: 10000 });
}

test("clicks and orders a product, then checks it on the dashboard", async ({
  page,
}) => {
  await login(page);

  await page.locator("text=Order Here").click();
  await page.waitForURL("**/userPOS", { timeout: 10000 });

  const productCards = page.locator("div.bg-white >> h3");
  await expect(productCards.first()).toBeVisible({ timeout: 10000 });
  expect(await productCards.count()).toBeGreaterThan(0);

  const firstAddButton = page.locator('button:has-text("Add to Cart")').first();
  await firstAddButton.click();

  const cartBadge = page.locator("header .relative span").nth(1);
  await expect(cartBadge).toHaveText("1");

  await page.locator('button:has-text("Place Order")').click();

  await expect(page.locator("text=Order Placed Successfully!")).toBeVisible({
    timeout: 10000,
  });

  await page.locator('button:has-text("View Dashboard")').click();
  await page.waitForURL("**/userdashboard", { timeout: 10000 });

  await page.locator("text=View Orders").click();

  const orderRow = page.locator("table tbody tr").first();
  await expect(orderRow).toContainText(/pending/i);
});

test("clicks and orders multiple products, then checks them on the dashboard", async ({
  page,
}) => {
  await login(page);

  await page.locator("text=Order Here").click();
  await page.waitForURL("**/userPOS", { timeout: 10000 });

  // get all product cards
  const productCards = page.locator("div.bg-white");
  await expect(productCards.first()).toBeVisible({ timeout: 10000 });
  expect(await productCards.count()).toBeGreaterThan(1);

  // First product
  const firstCard = productCards.nth(0);
  const firstHeading = await firstCard.locator("h3").innerText();
  await firstCard.locator('button:has-text("Add to Cart")').click();

  // Second product
  const secondCard = productCards.nth(1);
  const secondHeading = await secondCard.locator("h3").innerText();
  await secondCard.locator('button:has-text("Add to Cart")').click();

  const cartBadge = page.locator("header .relative span").nth(1);
  await expect(cartBadge).toHaveText("2");

  await page.locator('button:has-text("Place Order")').click();

  await expect(page.locator("text=Order Placed Successfully!")).toBeVisible({
    timeout: 10000,
  });

  await page.locator('button:has-text("View Dashboard")').click();
  await page.waitForURL("**/userdashboard", { timeout: 10000 });

  await page.locator("text=View Orders").click();

  const orderRows = page.locator("table tbody tr");
  await expect(orderRows.first()).toBeVisible({ timeout: 10000 });
  const rowCount = await orderRows.count();

  let found = false;
  const expectedOrderText = `${firstHeading} x1, ${secondHeading} x1`;
  // console.log(expectedOrderText);
  // console.log(rowCount);
  for (let i = 0; i < rowCount; i++) {
    const itemsCell = orderRows.nth(i).locator("td").nth(1);
    const cellText = await itemsCell.innerText();
    // console.log("Celltext: "+cellText);
    if (cellText.includes(expectedOrderText)) {
      found = true;
      break;
    }
  }

  expect(found).toBe(true);
});
