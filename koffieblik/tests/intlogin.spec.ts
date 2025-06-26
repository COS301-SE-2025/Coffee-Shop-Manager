import { test, expect, request } from '@playwright/test';

test.describe('Login API', () => {
  const BASE_URL = 'http://localhost:5000';

  test('Login succeeds with valid credentials', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/login`, {
      data: {
        email: 'test@example.com',
        password: 'P@ssword123',
      },
    });

    expect(response.ok()).toBeTruthy();
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.user).toBeDefined();
  });

  test('Login fails with invalid credentials', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/login`, {
      data: {
        email: 'invalid@example.com',
        password: 'wrongpass',
      },
    });

    expect(response.status()).toBe(401); // or 400 depending on your API
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.message).toMatch(/Invalid/i);
  });
});
