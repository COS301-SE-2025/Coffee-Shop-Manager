import http from "k6/http";
import { sleep, check } from "k6";

const API_BASE_URL = __ENV.API_BASE_URL || "http://localhost:5000";

// Fallback demo accounts
const TEST_ACCOUNTS = [
  {
    email: __ENV.TEST_EMAIL_1 || "user@coffee.com",
    password: __ENV.TEST_PASSWORD_1 || "user",
  },
  {
    email: __ENV.TEST_EMAIL_2 || "user@coffee.com",
    password: __ENV.TEST_PASSWORD_2 || "user",
  },
];

export const options = {
  vus: 50,         // 50 concurrent users
  duration: "30s", // run for 30 seconds
};

// Will hold per-VU assigned cookies
const vuCookies = {};

export function setup() {
  const sessionCookies = [];

  for (const acc of TEST_ACCOUNTS) {
    const loginRes = http.post(
      `${API_BASE_URL}/login`,
      JSON.stringify({ email: acc.email, password: acc.password }),
      { headers: { "Content-Type": "application/json" } }
    );

    check(loginRes, {
      [`login succeeded for ${acc.email}`]: (r) => r.status === 200,
    });

    const cookies = loginRes.headers["Set-Cookie"];
    if (!cookies) throw new Error(`❌ Login failed for ${acc.email}`);

    sessionCookies.push(cookies.split(";")[0]);
  }

  return { sessionCookies };
}

const today = new Date(Date.now()).toISOString().split("T")[0];

export default function (data) {
  // Assign cookie once per VU, then reuse it
  if (!vuCookies[__VU]) {
    vuCookies[__VU] =
      data.sessionCookies[Math.floor(Math.random() * data.sessionCookies.length)];
  }
  const sessionCookie = vuCookies[__VU];

  const url = `${API_BASE_URL}/get_orders`;
  const payload = JSON.stringify({
    start_Date: today,
    end_Date: today,
    offset: 0,
    limit: 5,
    orderBy: "order_number",
    orderDirection: "asc",
    filters: { status: "pending" },
  });

  const res = http.post(url, payload, {
    headers: {
      "Content-Type": "application/json",
      Cookie: sessionCookie,
    },
  });

  check(res, {
    [`get_orders request (VU ${__VU}) succeeded`]: (r) =>
      r.status === 200 || r.status === 201,
  });

  if (!(res.status === 200 || res.status === 201)) {
    console.error(`❌ [VU ${__VU}] Failed request: ${res.status} - ${res.body}`);
  }

  sleep(1);
}
