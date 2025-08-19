import { test, expect } from "@playwright/test";

test.describe("Login Flow", () => {
  // user test
  test("Login works with valid credentials user", async ({ page }) => {
    await page.goto("http://localhost:3000/login");
    await page.fill("#email", "user9@coffee.com");
    await page.fill("#password", "P@ssword123");

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
    await page.goto("http://localhost:3000/login");
    await page.fill("#email", "admin@coffee.com");
    await page.fill("#password", "admin");

    await Promise.all([
      page.waitForURL("**/dashboard"),
      page.click('button[type="submit"]'),
    ]);

    await expect(page).toHaveURL(/.*dashboard.*/);
    await expect(
      page.getByRole("heading", { name: /dashboard/i }),
    ).toBeVisible();
  });

  test("Shows error for invalid credentials", async ({ page }) => {
    await page.goto("http://localhost:3000/login");
    await page.fill("#email", "invalid@example.com");
    await page.fill("#password", "WrongPas@sword123");
    await page.click('button[type="submit"]');

    await expect(
      page.locator("text=/Invalid login credentials/i"),
    ).toBeVisible();
  });
});
