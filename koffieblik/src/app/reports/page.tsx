"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { useEffect, useMemo, useState } from "react";

type ProductInfo = {
  name: string;
  description?: string;
  price: number;
};

type OrderProduct = {
  product_id: string;
  quantity: number;
  price: number;
  products: ProductInfo;
};

type Order = {
  id: string;
  number: number;
  status: "pending" | "completed" | "cancelled";
  total_price: number;
  created_at: string;
  updated_at: string;
  order_products: OrderProduct[];
};

type GetOrdersResponse = {
  success?: boolean;
  sucess?: boolean;
  orders?: Order[];
  message?: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:5000";

const PRODUCT_COLORS = ["#D97706", "#F59E0B", "#FBBF24", "#FCD34D", "#FEF3C7"];

function currency(n: number) {
  return `R${(Math.round(n * 100) / 100).toLocaleString()}`;
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}
function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

type TimeRange = "day" | "week" | "month" | "year";

function getRange(range: TimeRange) {
  const now = new Date();
  const to = endOfDay(now);
  let from = new Date();
  if (range === "day") from = startOfDay(now);
  if (range === "week") {
    from = new Date(now);
    from.setDate(from.getDate() - 6);
    from = startOfDay(from);
  }
  if (range === "month") {
    from = new Date(now);
    from.setMonth(from.getMonth() - 1);
  }
  if (range === "year") {
    from = new Date(now);
    from.setFullYear(from.getFullYear() - 1);
  }
  return { from, to };
}

function rangeFilter(range: TimeRange) {
  const { from, to } = getRange(range);
  return (o: Order) => {
    const t = new Date(o.created_at);
    return t >= from && t <= to;
  };
}

export default function QuickReport() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>("week");
  const [selectedMetric, setSelectedMetric] = useState<"sales" | "orders">("sales");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE_URL}/order`, {
          credentials: "include",
          signal: ac.signal,
          headers: { Accept: "application/json" },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data: GetOrdersResponse = await res.json();
        const ok = (typeof data.success === "boolean" ? data.success : data.sucess) ?? false;

        if (!ok || !Array.isArray(data.orders)) {
          throw new Error(data.message || "Failed to load orders");
        }

        setOrders(data.orders);
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        console.error(e);
        setError(e?.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, []);

  const filtered = useMemo(() => orders.filter(rangeFilter(timeRange)), [orders, timeRange]);

  const { totalSales, ordersToday, busiestDay, topProduct } = useMemo(() => {
    const today = new Date();
    let sum = 0;
    let todayCount = 0;

    const dowCounts = new Map<string, number>();
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const productCount = new Map<string, number>();

    for (const o of filtered) {
      sum += o.total_price || 0;
      const ct = new Date(o.created_at);
      if (isSameDay(ct, today)) todayCount++;

      const day = dayNames[ct.getDay()];
      dowCounts.set(day, (dowCounts.get(day) || 0) + 1);

      for (const it of o.order_products || []) {
        const name = it.products?.name || "Unknown";
        productCount.set(name, (productCount.get(name) || 0) + (it.quantity || 0));
      }
    }

    let bd = "—";
    let bdVal = -1;
    for (const [k, v] of dowCounts) {
      if (v > bdVal) {
        bdVal = v;
        bd = k;
      }
    }

    let tp = "—";
    let tpVal = -1;
    for (const [k, v] of productCount) {
      if (v > tpVal) {
        tpVal = v;
        tp = k;
      }
    }

    return {
      totalSales: sum,
      ordersToday: todayCount,
      busiestDay: bd,
      topProduct: tp,
    };
  }, [filtered]);

  const chartSeries = useMemo(() => {
    const { from, to } = getRange(timeRange);
    const monthShort = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] as const;

    let labels: string[] = [];
    let keyOf = (d: Date) => "";

    if (timeRange === "day") {
      labels = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, "0")}:00`);
      keyOf = (d) => `${String(d.getHours()).padStart(2, "0")}:00`;
    } else if (timeRange === "week") {
      labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
      keyOf = (d) => {
        const name = dayNames[d.getDay()];
        return name === "Sun" ? "Sun" : name;
      };
    } else if (timeRange === "month") {
      const cur = startOfDay(new Date(from));
      const end = startOfDay(new Date(to));
      while (cur <= end) {
        labels.push(`${String(cur.getDate()).padStart(2,"0")} ${monthShort[cur.getMonth()]}`);
        cur.setDate(cur.getDate() + 1);
      }
      keyOf = (d) => `${String(d.getDate()).padStart(2,"0")} ${monthShort[d.getMonth()]}`;
    } else {
      const end = new Date(to.getFullYear(), to.getMonth(), 1);
      const start = new Date(end.getFullYear(), end.getMonth() - 11, 1);
      const cur = new Date(start);
      for (let i = 0; i < 12; i++) {
        labels.push(`${monthShort[cur.getMonth()]} ${cur.getFullYear()}`);
        cur.setMonth(cur.getMonth() + 1);
      }
      keyOf = (d) => `${monthShort[d.getMonth()]} ${d.getFullYear()}`;
    }

    const base = new Map(labels.map((l) => [l, { label: l, sales: 0, orders: 0 }]));

    for (const o of filtered) {
      const k = keyOf(new Date(o.created_at));
      const bucket = base.get(k);
      if (!bucket) continue;
      bucket.sales += o.total_price || 0;
      bucket.orders += 1;
    }

    return labels.map((l) => {
      const b = base.get(l)!;
      return {
        ...b,
        value: selectedMetric === "orders" ? b.orders : Math.round(b.sales * 100) / 100,
      };
    });
  }, [filtered, selectedMetric, timeRange]);

  const metricLabel = selectedMetric === "orders" ? "Orders" : "Sales (R)";
  const RANGE_TITLES: Record<TimeRange, string> = {
    day: "Today",
    week: "This Week",
    month: "This Month",
    year: "This Year",
  };

  const productMix = useMemo(() => {
    const counts = new Map<string, number>();
    for (const o of filtered) {
      for (const it of o.order_products || []) {
        const name = it.products?.name || "Unknown";
        counts.set(name, (counts.get(name) || 0) + (it.quantity || 0));
      }
    }
    const entries = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
    const total = entries.reduce((s, [, v]) => s + v, 0) || 1;
    const top = entries.slice(0, 4);
    const othersVal = entries.slice(4).reduce((s, [, v]) => s + v, 0);

    const pie = top.map(([name, val], i) => ({
      name,
      value: Math.round((val / total) * 100),
      color: PRODUCT_COLORS[i % PRODUCT_COLORS.length],
    }));

    if (othersVal > 0) {
      pie.push({
        name: "Others",
        value: Math.round((othersVal / total) * 100),
        color: PRODUCT_COLORS[4 % PRODUCT_COLORS.length],
      });
    }
    return pie;
  }, [filtered]);

  const hourly = useMemo(() => {
    const slots = ["06:00","08:00","10:00","12:00","14:00","16:00","18:00","20:00","22:00"];
    const buckets = new Map(slots.map((s) => [s, { time: s, orders: 0, revenue: 0 }]));

    for (const o of filtered) {
      const t = new Date(o.created_at);
      const hr = t.getHours();
      const clamped = Math.min(22, Math.max(6, hr - (hr % 2)));
      const label = `${String(clamped).padStart(2, "0")}:00`;
      const b = buckets.get(label);
      if (!b) continue;
      b.orders += 1;
      b.revenue += o.total_price || 0;
    }
    return slots.map((s) => buckets.get(s)!);
  }, [filtered]);

  const highlights = useMemo(() => {
    if (filtered.length === 0) return [];
    const largest = [...filtered].sort((a, b) => b.total_price - a.total_price)[0];
    const recentCompleted = [...filtered]
      .filter((o) => o.status === "completed")
      .sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at))
      .slice(0, 3);

    const fmt = (o: Order) => ({
      id: `#${o.number}`,
      note: o === largest ? "Highest single order" : "Recent completed order",
      amount: currency(o.total_price),
      time: new Date(o.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: o.status,
    });

    const set = new Map<string, ReturnType<typeof fmt>>();
    set.set(largest.id, fmt(largest));
    for (const o of recentCompleted) set.set(o.id, fmt(o));

    return Array.from(set.values()).slice(0, 4);
  }, [filtered]);

  if (loading) {
    return (
      <main className="relative p-6">
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-xl" style={{ color: "var(--primary-3)" }}>Loading reports...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative p-6">
      <div className="relative z-10">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ color: "var(--primary-3)" }}>
                Reports Dashboard
              </h1>
              <p className="text-sm opacity-70" style={{ color: "var(--primary-3)" }}>
                Comprehensive analytics and insights
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                className="px-4 py-3 border-2 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 transition-all duration-200"
                style={{
                  backgroundColor: "var(--primary-4)",
                  borderColor: "var(--primary-3)",
                  color: "var(--primary-3)",
                }}
              >
                <option value="day">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
              <button
                className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
                style={{
                  backgroundColor: "var(--primary-4)",
                  color: "var(--primary-1)",
                }}
                onClick={() => {
                  const header = ["number", "status", "total_price", "created_at"];
                  const rows = filtered.map((o) => [o.number, o.status, o.total_price, o.created_at]);
                  const csv = [header, ...rows]
                    .map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(","))
                    .join("\n");
                  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `orders_${timeRange}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <svg className="inline mr-2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Export
              </button>
            </div>
          </div>
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600">
              Error: {error}
            </div>
          )}
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: "Total Sales", value: currency(totalSales), subtitle: RANGE_TITLES[timeRange] },
            { title: "Orders Today", value: String(ordersToday), subtitle: `${filtered.length} total orders` },
            { title: "Top Product", value: topProduct || "—", subtitle: "Best seller" },
            { title: "Busiest Day", value: busiestDay || "—", subtitle: "Peak traffic" },
          ].map(({ title, value, subtitle }, index) => (
            <div
              key={index}
              className="p-6 rounded-xl shadow-lg backdrop-blur-sm hover:scale-105 transition-all duration-200"
              style={{
                backgroundColor: "var(--primary-2)",
                border: "2px solid var(--primary-3)",
              }}
            >
              <h2 className="text-sm font-medium mb-2 opacity-70" style={{ color: "var(--primary-3)" }}>
                {title}
              </h2>
              <p className="text-3xl font-bold mb-1" style={{ color: "var(--primary-3)" }}>
                {value}
              </p>
              <p className="text-xs opacity-60" style={{ color: "var(--primary-3)" }}>
                {subtitle}
              </p>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div
            className="lg:col-span-2 rounded-xl shadow-lg backdrop-blur-sm"
            style={{
              backgroundColor: "var(--primary-2)",
              border: "2px solid var(--primary-3)",
            }}
          >
            <div className="p-6 border-b-2" style={{ borderColor: "var(--primary-3)" }}>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold" style={{ color: "var(--primary-3)" }}>
                  {RANGE_TITLES[timeRange]} Performance
                </h2>
                <div className="flex gap-2">
                  {(["sales", "orders"] as const).map((metric) => (
                    <button
                      key={metric}
                      onClick={() => setSelectedMetric(metric)}
                      className="px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200"
                      style={{
                        backgroundColor: selectedMetric === metric ? "var(--primary-2)" : "var(--primary-4)",
                        color: selectedMetric === metric ? "var(--primary-1)" : "var(--primary-3)",
                        border: "2px solid var(--primary-3)"
                      }}
                    >
                      {metric.charAt(0).toUpperCase() + metric.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartSeries}>
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #F3F4F6",
                      borderRadius: "12px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                    }}
                    formatter={(value: any) => selectedMetric === "sales" ? currency(value) : value}
                    labelFormatter={(l) => `${metricLabel} • ${l}`}
                  />
                  <Area type="monotone" dataKey="value" stroke="#F59E0B" strokeWidth={3} fill="url(#colorGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div
            className="rounded-xl shadow-lg backdrop-blur-sm"
            style={{
              backgroundColor: "var(--primary-2)",
              border: "2px solid var(--primary-3)",
            }}
          >
            <div className="p-6 border-b-2" style={{ borderColor: "var(--primary-3)" }}>
              <h2 className="text-xl font-bold" style={{ color: "var(--primary-3)" }}>
                Product Distribution
              </h2>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={productMix}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {productMix.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-6 space-y-3">
                {productMix.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm font-medium" style={{ color: "var(--primary-3)" }}>
                        {item.name}
                      </span>
                    </div>
                    <span className="text-sm font-bold" style={{ color: "var(--primary-3)" }}>
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div
            className="rounded-xl shadow-lg backdrop-blur-sm"
            style={{
              backgroundColor: "var(--primary-2)",
              border: "2px solid var(--primary-3)",
            }}
          >
            <div className="p-6 border-b-2" style={{ borderColor: "var(--primary-3)" }}>
              <h2 className="text-xl font-bold" style={{ color: "var(--primary-3)" }}>
                Hourly Patterns
              </h2>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={hourly}>
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip
                    formatter={(v: any, n: any) => (n === "revenue" ? currency(v) : v)}
                    labelFormatter={(l) => `Time ${l}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#F59E0B"
                    strokeWidth={3}
                    dot={{ fill: "#F59E0B", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div
            className="rounded-xl shadow-lg backdrop-blur-sm"
            style={{
              backgroundColor: "var(--primary-2)",
              border: "2px solid var(--primary-3)",
            }}
          >
            <div className="p-6 border-b-2" style={{ borderColor: "var(--primary-3)" }}>
              <h2 className="text-xl font-bold" style={{ color: "var(--primary-3)" }}>
                Notable Orders
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {highlights.map(({ id, note, amount, time, status }) => (
                  <div
                    key={id}
                    className="p-4 rounded-xl hover:scale-102 transition-all duration-200"
                    style={{
                      backgroundColor: "var(--primary-4)",
                      border: "2px solid var(--primary-3)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg" style={{ color: "var(--primary-3)" }}>
                          {id}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-semibold ${
                            status === "completed"
                              ? "bg-green-100 text-green-700"
                              : status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {status}
                        </span>
                      </div>
                      <span className="text-lg font-bold" style={{ color: "var(--primary-3)" }}>
                        {amount}
                      </span>
                    </div>
                    <p className="text-sm mb-1 opacity-80" style={{ color: "var(--primary-3)" }}>
                      {note}
                    </p>
                    <p className="text-xs opacity-60" style={{ color: "var(--primary-3)" }}>
                      {time}
                    </p>
                  </div>
                ))}
                {highlights.length === 0 && (
                  <p className="text-center py-8 opacity-60" style={{ color: "var(--primary-3)" }}>
                    No notable orders in this period
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}