import { test, expect } from '@playwright/test';



test.describe('Signup API', () => {
    const BASE_URL = 'http://localhost:5000';
    const username = 'testuser';
    const email = 'test@example.com';
    const password = 'P@ssword123';

    test('signup succeeds with new user', async ({ request }) => {
        const response = await request.post(`${BASE_URL}/signup`, {
            data: {
                username,
                email,
                password,
            },
        });

        const body = await response.json();
        expect(response.status()).toBe(201);
        expect(body.success).toBe(true);
        expect(body.message).toMatch(/registered/i);
    });

    test('fails to register duplicate user', async ({ request }) => {
        const response = await request.post(`${BASE_URL}/signup`, {
            data: {
                username,
                email,
                password,
            },
        });

        const body = await response.json();
        expect(response.status()).toBeGreaterThanOrEqual(400);
        expect(body.success).toBe(false);
        expect(body.message).toMatch(/already registered|already exists/i);
    });
});
