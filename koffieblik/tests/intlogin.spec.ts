import { test, expect, request } from "@playwright/test";


test.describe('Login API', () => {
    const BASE_URL = 'http://localhost:5000';
    const testEmail = 'user9@coffee.com';
    const testPassword = 'P@ssword123';

    test('POST /login to pass', async ({ request }) => {
        const response = await request.post(`${BASE_URL}/login`, {
            data: {
                email: testEmail,
                password: testPassword,
            },
        });

        expect(response.ok()).toBeTruthy();
        const json = await response.json();
        expect(json.success).toBe(true);
        expect(json.user).toBeDefined();

    });

    expect(response.ok()).toBeTruthy();
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.user).toBeDefined();
  });

  test("POST /login to fail", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/login`, {
      data: {
        email: "invalid@example.com",
        password: "wrongpass",
      },
    });

    expect(response.status()).toBe(401);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.message).toMatch(/Invalid/i);
  });

  test("POST /login fails when email is missing", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/login`, {
      data: { password: "P@ssword123" },
    });

    expect(response.status()).toBe(400);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.message).toMatch(/email and password required/i);
  });

  test("POST /login fails when password is missing", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/login`, {
      data: { email: "test0@example.com" },
    });

    expect(response.status()).toBe(400);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.message).toMatch(/email and password required/i);
  });

  test("POST /login fails with empty body", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/login`, {
      data: {},
    });


    test('POST /login sets token cookie on success', async ({ request }) => {
        const response = await request.post(`${BASE_URL}/login`, {
            data: {
                email: testEmail,
                password: testPassword,
            },
        });

        expect(response.status()).toBe(200);
        const setCookie = response.headers()['set-cookie'];
        expect(setCookie).toBeDefined();
        expect(setCookie).toContain('token=');
    });


});
