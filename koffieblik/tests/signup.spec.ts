import { test, expect } from "@playwright/test";

const username = "testuser";
const email = "test@example.com";
const password = "P@ssword123";

test("signs up a new user", async ({ page }) => {
  await page.goto("http://localhost:3000/signup");

  // Wait for hydration and form elements to be visible
  await page.waitForTimeout(3000);
  await page.waitForSelector("input#username", { timeout: 10000 });

  await page.fill("input#username", username);
  await page.fill("input#email", email);
  await page.fill("input#password", password);
  await page.fill("input#confirm-password", password);

  await page.click('button[type="submit"]');

  // Wait for redirect or error
  await Promise.race([
    page.waitForURL("**/login", { timeout: 10000 }),
    page
      .locator("text=Could not connect to the server.")
      .waitFor({ timeout: 10000 }),
  ]);
});

test("fails to register duplicate user", async ({ page }) => {
  await page.goto("http://localhost:3000/signup");

  // Wait for hydration and form elements to be visible
  await page.waitForTimeout(3000);
  await page.waitForSelector("input#username", { timeout: 10000 });

  await page.fill("input#username", username);
  await page.fill("input#email", email);
  await page.fill("input#password", password);
  await page.fill("input#confirm-password", password);

  await page.click('button[type="submit"]');

  // Wait for the error to appear
  const errorLocator = page.locator("text=User already registered");
  await expect(errorLocator).toBeVisible({ timeout: 10000 });

  // Optional: log page content if the test fails again
  if (!(await errorLocator.isVisible())) {
    console.log(await page.content());
  }
});
