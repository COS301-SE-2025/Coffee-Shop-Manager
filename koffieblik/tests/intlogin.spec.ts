import { test, expect, request } from '@playwright/test';

test.describe('Login API', () => {
  const BASE_URL = 'http://localhost:5000';

  test('POST /login to pass', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/login`, {
      data: {
        email: 'test0@example.com',
        password: 'P@ssword123',
      },
    });

    expect(response.ok()).toBeTruthy();
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.user).toBeDefined();
  });

  test('POST /login to fail', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/login`, {
      data: {
        email: 'invalid@example.com',
        password: 'wrongpass',
      },
    });

    expect(response.status()).toBe(401);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.message).toMatch(/Invalid/i);
  });
});
