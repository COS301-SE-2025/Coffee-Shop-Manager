import { test, expect } from "@playwright/test";





test.describe('Signup API', () => {
  const BASE_URL = 'http://localhost:5000';
  const username = 'testuser0';
  const email = 'test0@example.com';
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


  test('fails when email is missing', async ({ request }) => {

    const response = await request.post(`${BASE_URL}/signup`, {
      data: { username, password },
    });

    const body = await response.json();
    expect(response.status()).toBe(400);
    expect(body.success).toBe(false);
    expect(body.message).toMatch(/email, password and username are required/i);
  });


  test('fails when password is missing', async ({ request }) => {

    const response = await request.post(`${BASE_URL}/signup`, {
      data: { username, email },
    });

    const body = await response.json();
    expect(response.status()).toBe(400);
    expect(body.success).toBe(false);
    expect(body.message).toMatch(/email, password and username are required/i);
  });

  test("fails when username is missing", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/signup`, {
      data: { email, password },
    });

    const body = await response.json();
    expect(response.status()).toBe(400);
    expect(body.success).toBe(false);
    expect(body.message).toMatch(/email, password and username are required/i);
  });

  test("fails with completely empty body", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/signup`, {
      data: {},
    });

    const body = await response.json();
    expect(response.status()).toBe(400);
    expect(body.success).toBe(false);
    expect(body.message).toMatch(/email, password and username are required/i);
  });
});
