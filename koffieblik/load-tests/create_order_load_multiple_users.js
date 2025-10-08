import http from "k6/http";
import { sleep, check } from "k6";

const API_BASE_URL = __ENV.API_BASE_URL || "https://api.diekoffieblik.co.za";

// Two demo accounts
const TEST_ACCOUNTS = [
  {
    email: __ENV.TEST_EMAIL_1 || "admin@coffee.com",
    password: __ENV.TEST_PASSWORD_1 || "admin",
  },
  {
    email: __ENV.TEST_EMAIL_2 || "user@coffee.com",
    password: __ENV.TEST_PASSWORD_2 || "user",
  },
   {
    email: __ENV.TEST_EMAIL_3 || "will@coffee.com",
    password: __ENV.TEST_PASSWORD_3 || "Password1!",
  },
];

export const options = {
  vus: 50,         // 2 concurrent virtual users
  duration: "10s" // run for 10 seconds
};

// Store per-VU assignment
const vuCookies = {};

// Runs once before all VUs
export function setup() {
  const sessionCookies = TEST_ACCOUNTS.map((acc) => {
    const loginRes = http.post(
      `${API_BASE_URL}/login`,
      JSON.stringify({ email: acc.email, password: acc.password }),
      { headers: { "Content-Type": "application/json" } }
    );

    check(loginRes, {
      [`login succeeded for ${acc.email}`]: (r) => r.status === 200,
    });

    const cookies = loginRes.headers["Set-Cookie"];
    if (!cookies) {
      throw new Error(`❌ Login failed for ${acc.email}, no Set-Cookie received`);
    }

    return cookies.split(";")[0]; // just "sb-access-token=...."
  });

  return { sessionCookies };
}

// Runs in each VU
export default function (data) {
  // Assign a random cookie once per VU
  if (!vuCookies[__VU]) {
    vuCookies[__VU] =
      data.sessionCookies[Math.floor(Math.random() * data.sessionCookies.length)];
  }
  const cookie = vuCookies[__VU];

  const payload = JSON.stringify({
    products: [{ product: "Americano", quantity: 1 }],
  });

  const res = http.post(`${API_BASE_URL}/create_order`, payload, {
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie, // 🔑 simulate logged-in user
    },
  });

  check(res, {
    [`order request (VU ${__VU}) succeeded`]: (r) =>
      r.status === 200 || r.status === 201,
  });

  if (!(res.status === 200 || res.status === 201)) {
    console.error(`❌ [VU ${__VU}] Failed request: ${res.status} - ${res.body}`);
  }

  sleep(1);
}
