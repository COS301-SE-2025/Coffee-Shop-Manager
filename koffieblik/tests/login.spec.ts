import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
    test('Login works with valid credentials', async ({ page }) => {
        await page.goto('http://localhost:3000/login');
        await page.fill('#email', 'testuser@example.com');     
        await page.fill('#password', 'P@ssword123');

        await Promise.all([
            page.waitForURL('**/dashboard'),
            page.click('button[type="submit"]'),
        ]);

        await expect(page).toHaveURL(/.*dashboard.*/);
        await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
    });

    test('Shows error for invalid credentials', async ({ page }) => {
        await page.goto('http://localhost:3000/login');
        await page.fill('#email', 'invalid@example.com');
        await page.fill('#password', 'WrongPas@sword123');
        await page.click('button[type="submit"]');

        
        await expect(page.locator('text=/Invalid login credentials/i')).toBeVisible();
    });
});
