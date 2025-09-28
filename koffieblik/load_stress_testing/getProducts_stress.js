import http from "k6/http";
import { sleep, check } from "k6";

const API_BASE_URL = __ENV.API_BASE_URL || "http://localhost:5000";
const TEST_EMAIL = __ENV.TEST_EMAIL || "admin@coffee.com";
const TEST_PASSWORD = __ENV.TEST_PASSWORD || "admin";

export const options = {
  stages: [
    { duration: "30s", target: 50 },   
    { duration: "1m", target: 100 },    
    { duration: "1m", target: 150 },   
    { duration: "30s", target: 0 },    
  ],
  thresholds: {
    http_req_failed: ["rate<0.05"], // less than 5% failures is acceptable
    http_req_duration: ["p(95)<2000"], // 95% of requests < 2s
  },
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


// Executed by each VU during the test
export default function (data) {
    const url = `${API_BASE_URL}/getProducts`;


    const res = http.get(url, {
        headers: {
            // "Content-Type": "application/json", only needed for post
            Cookie: data.sessionCookie, // 🔑 send the HttpOnly cookie
        },
    });

    check(res, {
        "product request succeeded": (r) => r.status === 200 || r.status === 201,
    });


    if (!(res.status === 200 || res.status === 201)) {
        console.error(`❌ Failed request: ${res.status} - ${res.body}`);
    }


    sleep(1);
}
