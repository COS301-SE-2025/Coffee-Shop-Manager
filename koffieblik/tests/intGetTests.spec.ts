import { test, expect, request } from "@playwright/test";


const BASE_URL = 'http://localhost:5000';
const email = 'user9@coffee.com';
const password = 'P@ssword123';


let tokenCookie: string = "";

test.describe("API Integration Tests", () => {
  test.beforeAll(async () => {
    const loginContext = await request.newContext();
    const loginResponse = await loginContext.post(`${BASE_URL}/login`, {
      data: { email, password },
    });

    expect(loginResponse.status()).toBe(200);

    const rawSetCookie = loginResponse.headers()["set-cookie"];
    expect(rawSetCookie).toBeDefined();

    const match = rawSetCookie.match(/token=[^;]+/);
    if (!match) {
      throw new Error("Token cookie not found in Set-Cookie header");
    }

    tokenCookie = match[0];
  });

  test("GET /get_orders returns order list", async () => {
    const context = await request.newContext({
      extraHTTPHeaders: {
        Cookie: tokenCookie,
      },
    });

    const res = await context.get(`${BASE_URL}/get_orders`);
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(Array.isArray(body.orders)).toBe(true);
  });

  test("GET /getProducts returns product list", async () => {
    const context = await request.newContext({
      extraHTTPHeaders: {
        Cookie: tokenCookie,
      },
    });

    const res = await context.get(`${BASE_URL}/getProducts`);
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(Array.isArray(body.products)).toBe(true);
  });

  test("GET /get_stock returns inventory data", async () => {
    const context = await request.newContext({
      extraHTTPHeaders: {
        Cookie: tokenCookie,
      },
    });

    const res = await context.get(`${BASE_URL}/get_stock`);
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(Array.isArray(body.stock)).toBe(true);
  });

  test("GET /get_orders fails without auth token", async () => {
    const context = await request.newContext();
    const res = await context.get(`${BASE_URL}/get_orders`);

    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body?.success ?? false).toBe(false);
    expect(body?.error ?? "").toMatch(/missing auth token/i);
  });

  test("GET /getProducts fails without auth token", async () => {
    const context = await request.newContext();
    const res = await context.get(`${BASE_URL}/getProducts`);

    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body?.success ?? false).toBe(false);
    expect(body?.error ?? "").toMatch(/missing auth token/i);
  });

  test("GET /get_stock fails without auth token", async () => {
    const context = await request.newContext();
    const res = await context.get(`${BASE_URL}/get_stock`);

    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body?.success ?? false).toBe(false);
    expect(body?.error ?? "").toMatch(/missing auth token/i);
  });
});
