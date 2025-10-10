import { test, expect } from "@playwright/test";

test.describe("Login Flow", () => {
  // user test
  test("Login works with valid credentials user", async ({ page }) => {
    await page.goto("https://www.diekoffieblik.co.za/login");
    await page.fill("#email", "user@coffee.com");
    await page.fill("#password", "user");

    await Promise.all([
      page.waitForURL("**/userdashboard"),
      page.click('button[type="submit"]'),
    ]);

    await expect(page).toHaveURL(/.*userdashboard.*/);
    await expect(
      page.getByRole("heading", { name: /dashboard/i }),
    ).toBeVisible();
  });

  test("Login works with valid credentials admin", async ({ page }) => {
    await page.goto("https://www.diekoffieblik.co.za/login");
    await page.fill("#email", "admin@coffee.com");
    await page.fill("#password", "admin");

    await Promise.all([
      page.waitForURL("**/dashboard"),
      page.click('button[type="submit"]'),
    ]);

    await expect(page).toHaveURL(/.*dashboard.*/);
    await expect(
      page.getByRole("heading", { name: /^Dashboard$/ })
    ).toBeVisible();

  });

  test("Shows error for invalid credentials", async ({ page }) => {
    await page.goto("https://www.diekoffieblik.co.za/login");
    await page.fill("#email", "invalid@example.com");
    await page.fill("#password", "WrongPas@sword123");
    await page.click('button[type="submit"]');
    await expect(
      page.locator("text=/Invalid login credentials/i")
    ).toBeVisible({ timeout: 10000 }); // wait up to 10 seconds

  });
});
