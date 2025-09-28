import http from "k6/http";
import { sleep, check } from "k6";

const API_BASE_URL = __ENV.API_BASE_URL || "http://localhost:5000";
const TEST_EMAIL = __ENV.TEST_EMAIL || "admin@coffee.com";
const TEST_PASSWORD = __ENV.TEST_PASSWORD || "admin";

export const options = {
    vus: 50,          // 50 concurrent users
    duration: "30s",  // run for 30 seconds
};

// Will run once before the load test starts
export function setup() {
    const loginRes = http.post(
        `${API_BASE_URL}/login`,
        JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
        {
            headers: { "Content-Type": "application/json" },
        }
    );

    check(loginRes, { "login succeeded": (r) => r.status === 200 });

    const cookies = loginRes.headers["Set-Cookie"];
    if (!cookies) {
        throw new Error("❌ Login failed, no Set-Cookie header received");
    }

    // Store session cookie (HttpOnly is fine, we just forward it in headers)
    const sessionCookie = cookies.split(";")[0];
    return { sessionCookie };
}
const today = new Date(Date.now()).toISOString().split("T")[0];

// Executed by each VU during the test
export default function (data) {
    const url = `${API_BASE_URL}/get_orders`;
    const payload = JSON.stringify({
        start_Date: today,
        end_Date: today,
        offset: 0,
        limit: 5,
        orderBy: "order_number",
        orderDirection: "asc",
        filters: {
            status: "pending",
        },
    });

    const res = http.post(url, payload, {
        headers: {
            "Content-Type": "application/json",
            Cookie: data.sessionCookie, // 🔑 send the HttpOnly cookie
        },
    });

    check(res, {
        "order request succeeded": (r) => r.status === 200 || r.status === 201,
    });


    if (!(res.status === 200 || res.status === 201)) {
        console.error(`❌ Failed request: ${res.status} - ${res.body}`);
    }


    sleep(1);
}
