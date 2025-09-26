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
  sucess?: boolean; // backend typo
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

function rangeFilter(range: TimeRange) {
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

  // Fetch real data
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

  // Filter orders by time range
  const filtered = useMemo(() => orders.filter(rangeFilter(timeRange)), [orders, timeRange]);

  // Summary metrics
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

  // Weekly chart (only sales & orders)
  const weeklySeries = useMemo(() => {
    const order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const base = new Map(order.map((d) => [d, { day: d, sales: 0, orders: 0 }]));

    for (const o of filtered) {
      const d = new Date(o.created_at);
      const dow = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
      const bucket = base.get(dow === "Sun" ? "Sun" : dow);
      if (!bucket) continue;
      bucket.sales += o.total_price || 0;
      bucket.orders += 1;
    }

    const arr = order.map((d) => base.get(d)!);
    return arr.map((d) => ({
      ...d,
      value: selectedMetric === "orders" ? d.orders : Math.round(d.sales * 100) / 100,
    }));
  }, [filtered, selectedMetric]);

  const metricLabel = selectedMetric === "orders" ? "Orders" : "Sales (R)";

  // Product mix
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

  // Hourly trends
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

  // Highlights
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

  const summaryCards = useMemo(
    () => [
      { title: "Top Product", value: topProduct || "—", icon: "☕", trend: "", trendColor: "text-amber-700" },
      { title: "Busiest Day", value: busiestDay || "—", icon: "📈", trend: `${filtered.length} orders`, trendColor: "text-blue-600" },
      { title: "Total Sales", value: currency(totalSales), icon: "💰", trend: "", trendColor: "text-green-600" },
      { title: "Orders Today", value: String(ordersToday), icon: "🛒", trend: "", trendColor: "text-green-600" },
    ],
    [topProduct, busiestDay, totalSales, ordersToday, filtered.length]
  );

  return (
    <main className="min-h-screen px-6 py-4 bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">📊</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-amber-900">Analytics Dashboard</h1>
              <p className="text-amber-700">Real-time insights from live orders</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
              className="px-4 py-2 bg-white border border-amber-300 rounded-lg text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            <button
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-lg"
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
              Export Report
            </button>
          </div>
        </div>
        {loading && <p className="text-amber-700">Loading orders…</p>}
        {error && <p className="text-red-600">Error: {error}</p>}
      </div>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {summaryCards.map(({ title, value, icon, trend, trendColor }) => (
          <div
            key={title}
            className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/50"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-3xl transform group-hover:scale-110 transition-transform duration-200">
                {icon}
              </div>
              {trend && (
                <div className={`text-sm font-semibold ${trendColor} bg-gray-100 px-2 py-1 rounded-full`}>
                  {trend}
                </div>
              )}
            </div>
            <h3 className="text-sm font-medium text-amber-700 mb-1">{title}</h3>
            <p className="text-2xl font-bold text-amber-900">{value}</p>
            <div className="mt-3 h-1 bg-gradient-to-r from-amber-200 to-orange-200 rounded-full opacity-60" />
          </div>
        ))}
      </section>

      {/* Main + Product Mix */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50">
          <div className="p-6 border-b border-amber-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-amber-900 flex items-center gap-2">
              <span className="text-2xl">📈</span> Weekly Performance
            </h2>
            <div className="flex gap-2">
              {(["sales", "orders"] as const).map((metric) => (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    selectedMetric === metric
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md"
                      : "text-amber-700 hover:bg-amber-100"
                  }`}
                >
                  {metric[0].toUpperCase() + metric.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={weeklySeries}>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #F3F4F6",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value: any) =>
                    selectedMetric === "sales" ? currency(value) : value
                  }
                  labelFormatter={(l) => `${metricLabel} • ${l}`}
                />
                <Area type="monotone" dataKey="value" stroke="#F59E0B" strokeWidth={3} fill="url(#colorGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Distribution */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50">
          <div className="p-6 border-b border-amber-100">
            <h2 className="text-xl font-bold text-amber-900 flex items-center gap-2">
              <span className="text-2xl">🥧</span> Product Mix
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
            <div className="mt-4 space-y-2">
              {productMix.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-amber-800">{item.name}</span>
                  </div>
                  <span className="font-semibold text-amber-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Secondary Analytics */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Hourly Trends */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50">
          <div className="p-6 border-b border-amber-100">
            <h2 className="text-xl font-bold text-amber-900 flex items-center gap-2">
              <span className="text-2xl">⏰</span> Hourly Trends
            </h2>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={hourly}>
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip
                  formatter={(v: any, n: any) => (n === "revenue" ? currency(v) : v)}
                  labelFormatter={(l) => `Slot ${l}`}
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

        {/* Notable Orders */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50">
          <div className="p-6 border-b border-amber-100">
            <h2 className="text-xl font-bold text-amber-900 flex items-center gap-2">
              <span className="text-2xl">⭐</span> Notable Orders
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {highlights.map(({ id, note, amount, time, status }) => (
                <div
                  key={id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-amber-900">{id}</span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
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
                    <p className="text-sm text-amber-700 mb-1">{note}</p>
                    <div className="flex items-center gap-3 text-xs text-amber-600">
                      <span>🕐 {time}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-amber-900">{amount}</p>
                  </div>
                </div>
              ))}
              {highlights.length === 0 && <p className="text-amber-700">No notable orders in this range.</p>}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
