"use client";
import { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import CoffeeLoading from "assets/loading";
import {
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Order {
  id: string;
  number: number;
  status: string;
  total_price: number;
  created_at: string;
  order_products: {
    quantity: number;
    price: number;
    products: {
      name: string;
      price: number;
      description: string;
    };
  }[];
}

export default function DashboardPage() {
  const [filter, setFilter] = useState("Today");
  const [orders, setOrders] = useState<Order[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showOrder, setShowOrders] = useState(false);
  const [showPoints, setShowPoints] = useState(false);
  const [loading, setLoading] = useState(true); // Changed from false to true
  const [graphFilter, setGraphFilter] = useState<"day" | "month" | "year">(
    "month",
  );
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "user") {
      router.replace("/login");
    }
  }, [router]);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  async function fetchOrders() {
    setLoading(true); // Set loading when starting fetch
    try {
      const response = await fetch(`${API_BASE_URL}/get_orders`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setOrders(data.orders);
      } else {
        console.warn(
          "⚠️ Failed to fetch orders:",
          data.error || "Unknown error",
        );
      }
    } catch (error) {
      console.error("❌ Network or server error:", error);
    } finally {
      setLoading(false); // Always set loading to false when done
    }
  }

  const dateInputStyle =
    "p-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200";

  const now = new Date();
  let filteredOrders = orders;

  if (filter === "Today") {
    filteredOrders = orders.filter(
      (order) =>
        new Date(order.created_at).toDateString() === now.toDateString(),
    );
  } else if (filter === "This Week") {
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    filteredOrders = orders.filter(
      (order) => new Date(order.created_at) >= startOfWeek,
    );
  } else if (filter === "This Month") {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    filteredOrders = orders.filter(
      (order) => new Date(order.created_at) >= startOfMonth,
    );
  } else if (filter === "Custom Range" && startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    filteredOrders = orders.filter((order) => {
      const orderDate = new Date(order.created_at);
      return orderDate >= start && orderDate <= end;
    });
  }

  const getTotalLoyaltyPoints = () => {};

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Completed":
        return "text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs font-medium";
      case "Pending":
        return "text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full text-xs font-medium";
      case "Cancelled":
        return "text-red-700 bg-red-100 px-2 py-1 rounded-full text-xs font-medium";
      default:
        return "text-blue-700 bg-blue-100 px-2 py-1 rounded-full text-xs font-medium";
    }
  };

  // Add this mock data for the graph (replace with real data later)
  const pointsData = [
    { month: "Jan", points: 150 },
    { month: "Feb", points: 300 },
    { month: "Mar", points: 450 },
    { month: "Apr", points: 500 },
    { month: "May", points: 750 },
    { month: "Jun", points: 900 },
    { month: "Jul", points: 1250 },
  ];

  // Add this custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/80 backdrop-blur-md border border-[var(--primary-2)]/30 p-4 rounded-xl shadow-2xl">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-[var(--primary-2)]"></div>
            <p className="text-white font-medium text-sm">{label} 2025</p>
          </div>
          <p className="text-[var(--primary-2)] font-bold text-lg">
            {payload[0].value} points
          </p>
          <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--primary-2)]/50 to-transparent mt-2"></div>
        </div>
      );
    }
    return null;
  };

  function aggregatePoints(
    data: { date: string; points: number }[],
    filter: "day" | "month" | "year",
  ) {
    const result: { label: string; points: number }[] = [];
    const map = new Map<string, number>();

    data.forEach(({ date, points }) => {
      const d = new Date(date);
      let label = "";
      if (filter === "day") {
        label = d.toLocaleDateString("en-ZA", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      } else if (filter === "month") {
        label = d.toLocaleDateString("en-ZA", { year: "numeric", month: "short" });
      } else if (filter === "year") {
        label = d.getFullYear().toString();
      }
      map.set(label, (map.get(label) || 0) + points);
    });

    map.forEach((points, label) => {
      result.push({ label, points });
    });

    // Sort by label (date ascending)
    result.sort((a, b) => a.label.localeCompare(b.label));
    return result;
  }

  // Replace pointsData with your API data
  const rawPointsData = [
    { date: "2025-07-01", points: 100 },
    { date: "2025-07-01", points: 50 },
    { date: "2025-07-02", points: 200 },
    { date: "2025-06-30", points: 75 },
    { date: "2025-06-01", points: 300 },
    { date: "2024-07-01", points: 120 },
  ];

  const graphData = aggregatePoints(rawPointsData, graphFilter);

  return (
    <main className="relative min-h-full bg-transparent">
      {/* <div className="absolute inset-0 bg-black opacity-60 z-0"></div> */}
      {/* <div className="relative z-10"> */}
      {!showOrder && !showPoints && (
        <div className="p-8 flex flex-col min-h-full w-full">
          {/* Main content container - graph left, buttons right */}
          <div className="flex flex-col lg:flex-row gap-8 items-start mb-8">
            
            {/* Graph Section - Left Side */}
            <div className="w-full lg:w-2/3">
              <div
                className="backdrop-blur-sm border border-[var(--primary-4)] rounded-2xl shadow-xl p-8 relative overflow-hidden"
                style={{ 
                  backgroundColor: "var(--primary-3)",
                  background: "linear-gradient(135deg, var(--primary-3) 0%, rgba(255,255,255,0.05) 100%)"
                }}
              >
                {/* Add gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent pointer-events-none"></div>
                <div className="relative z-10">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-[var(--primary-2)] mb-1">
                        Loyalty Points Growth
                      </h2>
                      <p className="text-sm text-[var(--primary-4)] opacity-70">
                        Track your rewards journey over time
                      </p>
                    </div>
                    <div className="flex items-center gap-4 mt-4 sm:mt-0">
                      <div className="text-right">
                        <p className="text-xs text-[var(--primary-4)] opacity-60">Current Points</p>
                        <p className="text-lg font-bold text-green-400">1,250</p>
                      </div>
                      <div className="w-2 h-2 bg-[var(--primary-2)] rounded-full opacity-50"></div>
                    </div>
                  </div>

                  {/* Add this UI above your graph */}
                  <div className="mb-6 flex gap-4">
                    <button
                      className={`px-4 py-2 rounded-lg font-semibold border cursor-pointer ${
                        graphFilter === "day"
                          ? "bg-[var(--primary-2)] text-[var(--primary-3)]"
                          : "bg-[var(--primary-3)] text-[var(--primary-2)]"
                      }`}
                      onClick={() => setGraphFilter("day")}
                    >
                      Day
                    </button>
                    <button
                      className={`px-4 py-2 rounded-lg font-semibold border cursor-pointer ${
                        graphFilter === "month"
                          ? "bg-[var(--primary-2)] text-[var(--primary-3)]"
                          : "bg-[var(--primary-3)] text-[var(--primary-2)]"
                      }`}
                      onClick={() => setGraphFilter("month")}
                    >
                      Month
                    </button>
                    <button
                      className={`px-4 py-2 rounded-lg font-semibold border cursor-pointer ${
                        graphFilter === "year"
                          ? "bg-[var(--primary-2)] text-[var(--primary-3)]"
                          : "bg-[var(--primary-3)] text-[var(--primary-2)]"
                      }`}
                      onClick={() => setGraphFilter("year")}
                    >
                      Year
                    </button>
                  </div>

                  <div className="h-[300px] w-full relative bg-gradient-to-t from-black/5 to-transparent rounded-xl p-4 border border-white/10">
                    <div className="absolute inset-0 bg-grid-pattern opacity-5 rounded-xl"></div>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={graphData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <defs>
                          <linearGradient id="pointsGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--primary-2)" stopOpacity={0.4} />
                            <stop offset="30%" stopColor="var(--primary-2)" stopOpacity={0.2} />
                            <stop offset="70%" stopColor="var(--primary-2)" stopOpacity={0.1} />
                            <stop offset="100%" stopColor="var(--primary-2)" stopOpacity={0} />
                          </linearGradient>
                          <filter id="glow">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                            <feMerge> 
                              <feMergeNode in="coloredBlur"/>
                              <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                          </filter>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="2 4"
                          stroke="var(--primary-4)"
                          opacity={0.3}
                          horizontal={true}
                          vertical={false}
                        />
                        <XAxis
                          dataKey="label" // <-- Use "label" from your aggregated data
                          stroke="var(--primary-2)"
                          tick={{ fill: "var(--primary-2)", fontSize: 12, fontWeight: 500 }}
                          tickLine={false}
                          axisLine={{ stroke: "var(--primary-4)", opacity: 0.3 }}
                          dy={10}
                          label={{
                            value: graphFilter === "day"
                              ? "Date"
                              : graphFilter === "month"
                              ? "Month"
                              : "Year",
                            position: "insideBottom",
                            offset: -15,
                            fill: "var(--primary-2)",
                            fontSize: 14,
                            fontWeight: 700,
                          }}
                        />
                        <YAxis
                          stroke="var(--primary-2)"
                          tick={{ fill: "var(--primary-2)", fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `${value}`}
                          label={{
                            value: "Points",
                            angle: -90,
                            position: "insideLeft",
                            offset: 10,
                            fill: "var(--primary-2)",
                            fontSize: 14,
                            fontWeight: 700,
                          }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="points"
                          stroke="none"
                          fill="url(#pointsGradient)"
                          fillOpacity={1}
                        />
                        <Line
                          type="monotone"
                          dataKey="points"
                          stroke="var(--primary-2)"
                          strokeWidth={3}
                          dot={{ 
                            fill: "var(--primary-2)", 
                            strokeWidth: 0, 
                            r: 5,
                            filter: "url(#glow)"
                          }}
                          activeDot={{ 
                            r: 8, 
                            fill: "var(--primary-2)",
                            stroke: "rgba(255,255,255,0.8)",
                            strokeWidth: 3,
                            filter: "url(#glow)"
                          }}
                          filter="url(#glow)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                </div>
              </div>
            </div>

            {/* Buttons Section - Right Side */}
            <div className="w-full lg:w-1/3 flex flex-col gap-6">
              <button
                onClick={() => {
                  setShowOrders(true);
                  fetchOrders();
                }}
                className="select-none w-full px-6 py-4 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all border border-[var(--primary-4)] text-left flex items-center gap-4 text-[var(--primary-2)]"
                style={{ backgroundColor: "var(--primary-3)" }}
              >
                <div className="text-3xl">📋</div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--primary-2)]">
                    View Orders
                  </h2>
                  <p className="text-sm text-[var(--primary-4)]">
                    Click to view your past orders.
                  </p>
                </div>
              </button>

              <button
                className="select-none w-full px-6 py-4 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all border border-[var(--primary-4)] text-left flex items-center gap-4 text-[var(--primary-2)]"
                style={{ backgroundColor: "var(--primary-3)" }}
                onClick={() => {
                  setShowPoints(true);
                }}
              >
                <div className="text-3xl">🎯</div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--primary-2)]">
                    See Points
                  </h2>
                  <p className="text-sm text-[var(--primary-4)]">
                    Check your rewards or loyalty points.
                  </p>
                </div>
              </button>

              {/* Quote Message - Right side, below buttons */}
              <div className="mt-8 text-center">
                <p
                  className="text-lg italic"
                  style={{ color: "var(--primary-3)" }}
                >
                  "Good coffee is a pleasure. Good friends are a treasure."
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      {showOrder && (
        <div className="p-8">
          {loading ? (
            <CoffeeLoading visible={true} /> // Changed from loading to true
          ) : (
            <>
              <button
                className="select-none backdrop-blur-sm border border-[var(--primary-4)] rounded-xl shadow-md px-4 py-2 inline-block text-[var(--primary-2)] text-xl font-semibold leading-none"
                style={{ backgroundColor: "var(--primary-3)" }}
                onClick={() => setShowOrders(false)}
              >
                ←
              </button>

              {/* Orders Section */}
              <section
                className="backdrop-blur-sm border border-[var(--primary-2)] rounded-2xl shadow-xl"
                style={{ backgroundColor: "var(--primary-3)" }}
              >
                {/* Heading */}
                <div
                  className="p-6 border-b-2"
                  style={{
                    borderColor: "var(--primary-4)", // more contrast
                    backgroundColor: "var(--primary-3)",
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: "var(--primary-4)" }}
                      >
                        <span
                          className="text-sm"
                          style={{ color: "var(--primary-2)" }}
                        >
                          📋
                        </span>
                      </div>

                      <h2
                        className="text-xl font-bold"
                        style={{ color: "var(--primary-2)" }}
                      >
                        Recent Orders
                      </h2>
                    </div>

                    {/* Filter */}
                    <div className="flex flex-wrap gap-3">
                      <select
                        className={`${dateInputStyle} text-[var(--primary-2)]`}
                        style={{
                          backgroundColor: "var(--primary-3)",
                          borderColor: "var(--primary-4)",
                          boxShadow: "0 0 0 0 transparent",
                        }}
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                      >
                        <option>Today</option>
                        <option>This Week</option>
                        <option>This Month</option>
                        <option>Custom Range</option>
                      </select>

                      {filter === "Custom Range" && (
                        <>
                          <input
                            type="date"
                            className={dateInputStyle}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            style={{
                              backgroundColor: "var(--primary-3)",
                              borderColor: "var(--primary-4)",
                              color: "var(--primary-2)",
                              boxShadow: "0 0 0 0 transparent",
                            }}
                          />
                          <span
                            className="flex items-center font-medium"
                            style={{ color: "var(--primary-2)" }}
                          >
                            to
                          </span>
                          <input
                            type="date"
                            className={dateInputStyle}
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            style={{
                              backgroundColor: "var(--primary-3)",
                              borderColor: "var(--primary-4)",
                              color: "var(--primary-2)",
                              boxShadow: "0 0 0 0 transparent",
                            }}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead
                      className="border-b"
                      style={{
                        backgroundColor: "var(--primary-3)",
                        borderColor: "var(--primary-2)",
                      }}
                    >
                      <tr>
                        <th
                          className="text-left px-6 py-4 font-semibold"
                          style={{ color: "var(--primary-2)" }}
                        >
                          Order #
                        </th>
                        <th
                          className="text-left px-6 py-4 font-semibold"
                          style={{ color: "var(--primary-2)" }}
                        >
                          Items
                        </th>
                        <th
                          className="text-left px-6 py-4 font-semibold"
                          style={{ color: "var(--primary-2)" }}
                        >
                          Total
                        </th>
                        <th
                          className="text-left px-6 py-4 font-semibold"
                          style={{ color: "var(--primary-2)" }}
                        >
                          Status
                        </th>
                        <th
                          className="text-left px-6 py-4 font-semibold"
                          style={{ color: "var(--primary-2)" }}
                        >
                          Date
                        </th>
                      </tr>
                    </thead>

                    <tbody
                      className="divide-y text-[var(--primary-3)]"
                      style={{
                        backgroundColor: "var(--primary-2)",
                        borderColor: "var(--primary-3)",
                      }}
                    >
                      {filteredOrders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-6 py-4 font-medium">
                            {order.number}
                          </td>
                          <td className="px-6 py-4">
                            {order.order_products
                              .map((p) => `${p.products.name} x${p.quantity}`)
                              .join(", ")}
                          </td>
                          <td className="px-6 py-4 font-semibold">
                            R{order.total_price}
                          </td>
                          <td className="px-6 py-4">
                            <span className={getStatusStyle(order.status)}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {new Date(order.created_at).toLocaleDateString(
                              "en-ZA",
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </div>
      )}

      {showPoints && (
        <div className="p-8">
          <button
            className="select-none backdrop-blur-sm border border-[var(--primary-4)] rounded-xl shadow-md px-4 py-2 inline-block text-[var(--primary-2)] text-xl font-semibold leading-none"
            style={{ backgroundColor: "var(--primary-3)" }}
            onClick={() => setShowPoints(false)}
          >
            ←
          </button>

          <div
            className="backdrop-blur-sm border border-[var(--primary-4)] rounded-2xl shadow-xl p-6 space-y-6 text-[var(--primary-2)]"
            style={{ backgroundColor: "var(--primary-3)" }}
          >
            {/* Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-[var(--primary-2)]">
                🎯 Your Loyalty Points
              </h2>
            </div>

            {/* Points Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div
                className="bg-white/10 backdrop-blur rounded-xl p-4 shadow-inner border"
                style={{ borderColor: "var(--primary-4)" }}
              >
                <p className="text-sm opacity-70">Total Points</p>
                <p className="text-3xl font-bold text-green-400">1,250</p>
              </div>

              <div
                className="bg-white/10 backdrop-blur rounded-xl p-4 shadow-inner border"
                style={{ borderColor: "var(--primary-4)" }}
              >
                <p className="text-sm opacity-70">Points This Month</p>
                <p className="text-2xl font-semibold text-yellow-300">300</p>
              </div>

              <div
                className="bg-white/10 backdrop-blur rounded-xl p-4 shadow-inner border"
                style={{ borderColor: "var(--primary-4)" }}
              >
                <p className="text-sm opacity-70">Redeemed Points</p>
                <p className="text-2xl font-semibold text-red-300">150</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 className="text-lg font-semibold text-[var(--primary-2)] mb-3">
                📅 Recent Activity
              </h3>
              <ul className="space-y-2 text-lg">
                <li className="bg-white/5 px-4 py-2 rounded-lg flex justify-between items-center">
                  <span>+100 points — Latte Purchase</span>
                  <span className="opacity-70">2025-07-29</span>
                </li>
                <li className="bg-white/5 px-4 py-2 rounded-lg flex justify-between items-center">
                  <span>+200 points — Referral Bonus</span>
                  <span className="opacity-70">2025-07-27</span>
                </li>
                <li className="bg-white/5 px-4 py-2 rounded-lg flex justify-between items-center">
                  <span>-150 points — Free Cappuccino</span>
                  <span className="opacity-70">2025-07-24</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* </div> */}
    </main>
  );
}
