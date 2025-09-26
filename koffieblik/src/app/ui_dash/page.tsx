"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import CoffeeLoading from "../../../assets/loading";

interface OrderProduct {
  quantity: number;
  price: number;
  products: {
    name: string;
    price: number;
    description?: string;
  };
}

interface Order {
  id: string;
  number: number;
  status: string;
  total_price: number;
  created_at: string;
  order_products: OrderProduct[];
}

const TABS = ["Dashboard", "POS", "Inventory", "Manage", "Reports", "Help", "Profile"];

export default function DashboardPage() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<string>("Dashboard");
  const [filter, setFilter] = useState<string>("Today");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [username, setUsername] = useState("Guest");
  const [orders, setOrders] = useState<Order[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // mock data
  useEffect(() => {
    setLoading(true);
    const mockOrders: Order[] = [
      {
        id: "1",
        number: 1001,
        status: "completed",
        total_price: 245.5,
        created_at: new Date().toISOString(),
        order_products: [
          {
            quantity: 2,
            price: 89.99,
            products: { name: "Premium Coffee Beans", price: 89.99, description: "Organic single-origin" },
          },
          {
            quantity: 1,
            price: 65.52,
            products: { name: "French Press", price: 65.52, description: "Glass press" },
          },
        ],
      },
      {
        id: "2",
        number: 1002,
        status: "pending",
        total_price: 125.75,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        order_products: [
          {
            quantity: 3,
            price: 41.92,
            products: { name: "Ceramic Mugs Set", price: 41.92, description: "Set of 3" },
          },
        ],
      },
      {
        id: "3",
        number: 1003,
        status: "completed",
        total_price: 89.25,
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        order_products: [
          { quantity: 1, price: 89.25, products: { name: "Electric Grinder", price: 89.25 } },
        ],
      },
      {
        id: "4",
        number: 1004,
        status: "cancelled",
        total_price: 45.0,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        order_products: [
          { quantity: 2, price: 22.5, products: { name: "Coffee Filters", price: 22.5 } },
        ],
      },
      {
        id: "5",
        number: 1005,
        status: "completed",
        total_price: 178.9,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        order_products: [
          { quantity: 1, price: 129.99, products: { name: "Espresso Machine", price: 129.99 } },
          { quantity: 2, price: 24.45, products: { name: "Espresso Cups", price: 24.45 } },
        ],
      },
    ];

    const t = setTimeout(() => {
      setOrders(mockOrders);
      setLoading(false);
    }, 800);

    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (selectedTab === "POS") router.push("/pos");
    if (selectedTab === "Inventory") router.push("/inventory");
    if (selectedTab === "Manage") router.push("/manage");
    if (selectedTab === "Reports") router.push("/reports");
    if (selectedTab === "Help") router.push("/help");
  }, [selectedTab, router]);

  // Utilities
  const formatCurrency = (value: number) => {
    return value.toLocaleString("en-ZA", { style: "currency", currency: "ZAR" });
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString();
  };

  // Filtering pipeline
  const now = useMemo(() => new Date(), []);

  const filteredByDate = useMemo(() => {
    if (filter === "Today") {
      return orders.filter((o) => new Date(o.created_at).toDateString() === now.toDateString());
    }

    if (filter === "This Week") {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      return orders.filter((o) => new Date(o.created_at) >= startOfWeek);
    }

    if (filter === "This Month") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return orders.filter((o) => new Date(o.created_at) >= startOfMonth);
    }

    if (filter === "Custom Range" && startDate && endDate) {
      const s = new Date(startDate);
      const e = new Date(endDate);
      e.setHours(23, 59, 59, 999);
      return orders.filter((o) => {
        const d = new Date(o.created_at);
        return d >= s && d <= e;
      });
    }

    return orders;
  }, [orders, filter, startDate, endDate, now]);

  const filteredOrders = useMemo(() => {
    let list = filteredByDate;

    if (statusFilter !== "All") {
      list = list.filter((o) => o.status.toLowerCase() === statusFilter.toLowerCase());
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((o) => {
        const matchesProduct = o.order_products.some((p) => p.products.name.toLowerCase().includes(q));
        const matchesNumber = o.number.toString().includes(q);
        return matchesProduct || matchesNumber;
      });
    }

    // newest first
    return list.slice().sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  }, [filteredByDate, statusFilter, search]);

  // Metrics
  const totalSales = useMemo(() => {
    return filteredOrders.filter((o) => o.status === "completed").reduce((s, o) => s + o.total_price, 0);
  }, [filteredOrders]);

  const ordersCompleted = filteredOrders.filter((o) => o.status === "completed").length;

  const totalOrders = filteredOrders.length;

  const topSelling = useMemo(() => {
    const map: Record<string, number> = {};
    for (const o of orders) {
      for (const p of o.order_products) map[p.products.name] = (map[p.products.name] || 0) + p.quantity;
    }
    const sorted = Object.entries(map).sort(([,a],[,b]) => b - a);
    return sorted.length ? sorted[0][0] : "—";
  }, [orders]);

  // helpers for status styles
  const statusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-[#2d5a27] text-white"; // Darker green
      case "pending":
        return "bg-[#8b4513] text-white"; // Darker amber/brown
      case "cancelled":
        return "bg-[#862a2a] text-white"; // Darker red
      default:
        return "bg-[#2c1810] text-white";
    }
  };

  // Metric card component
  const MetricCard: React.FC<{ title: string; value: string; subtitle?: string; icon?: React.ReactNode }> = ({ title, value, subtitle, icon }) => (
    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2c1810] to-[#1a0f0f] p-6 shadow-lg hover:scale-[1.01] transition-transform duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-sm text-white/90 font-medium">{title}</div>
            <div className="text-xl font-bold text-white mt-1">{value}</div>
            {subtitle && <div className="text-xs text-white/70 mt-1">{subtitle}</div>}
          </div>
        </div>
      </div>
    </div>
  );

  // Order Row
  const OrderRow: React.FC<{ order: Order }> = ({ order }) => (
    <button
      onClick={() => setActiveOrder(order)}
      className="w-full flex items-center justify-between gap-4 p-4 rounded-xl border border-[#3d2317] bg-[#2c1810] hover:bg-[#3d2317] transition-colors text-left"
      aria-label={`Open order ${order.number}`}
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-amber-600 to-stone-500 flex items-center justify-center font-semibold text-white">#{order.number}</div>
        <div className="min-w-0">
          <div className="font-semibold text-white truncate">{order.order_products.map(p => p.products.name).join(", ")}</div>
          <div className="text-xs text-white/70">{order.order_products.reduce((s,p) => s + p.quantity, 0)} unit(s) • {order.order_products.length} item(s)</div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="font-bold text-white">{formatCurrency(order.total_price)}</div>
          <div className="text-xs text-white/60">{new Date(order.created_at).toLocaleDateString()}</div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${statusClass(order.status)}`}>{order.status}</div>
      </div>
    </button>
  );

  return (
    <div className="min-h-screen text-white p-6">
      <div className="max-w-8xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Sidebar */}
        <aside className="lg:col-span-1 bg-[#1a0f0f] rounded-2xl p-4 flex flex-col gap-4 sticky top-6 h-fit">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-amber-600 flex items-center justify-center text-black font-bold">☕</div>
            <div>
              <div className="font-bold">{username}</div>
              <div className="text-xs text-white/70">Coffee Shop Owner</div>
            </div>
          </div>

          <nav className="flex flex-col gap-2 mt-4" aria-label="Main navigation">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTab(t)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all
                  ${selectedTab === t ? "bg-amber-600 text-black shadow-lg" : "hover:bg-white/10 text-white/80"}`}
              >
                {t}
              </button>
            ))}
          </nav>

          <div className="mt-4 border-t border-white/10 pt-4">
            <div className="text-xs text-white/70 mb-2">Quick filters</div>
            <div className="flex gap-2 flex-wrap">
              {['All','completed','pending','cancelled'].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1 rounded-full text-xs ${statusFilter === s ? 'bg-white/10' : 'bg-white/3 hover:bg-white/7'}`}>{s}</button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="lg:col-span-4 space-y-6">
          <div className="bg-[#3d2317] rounded-2xl p-6 space-y-6">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-extrabold text-white/80 tracking-tight">Coffee Shop Dashboard</h1>
                <p className="text-sm text-white/40">Snapshot of sales, orders and top items</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-xl bg-[#2c1810] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#c45e1b]"
                    aria-label="Search orders"
                  />
                </div>

                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="py-2 px-3 rounded-xl bg-[#2c1810]"
                  aria-label="Date filter"
                >
                  <option>Today</option>
                  <option>This Week</option>
                  <option>This Month</option>
                  <option>Custom Range</option>
                </select>

                {filter === "Custom Range" && (
                  <div className="flex items-center gap-2">
                    <input type="date" className="py-2 px-3 rounded-xl bg-stone-800" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    <input type="date" className="py-2 px-3 rounded-xl bg-stone-800" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                )}

                <div className="px-3 py-2 rounded-xl bg-stone-800">{totalOrders} orders</div>
              </div>
            </header>

            {/* Metrics */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard title="Total Revenue" value={formatCurrency(totalSales)} subtitle="Completed orders only" icon={<span>💰</span>} />
              <MetricCard title="Orders Completed" value={`${ordersCompleted}`} subtitle={`${ordersCompleted} successful`} icon={<span>✅</span>} />
              <MetricCard title="Top Product" value={topSelling} subtitle="Best seller" icon={<span>🏆</span>} />
              <MetricCard title="Visible Orders" value={`${totalOrders}`} subtitle={`Filtered by: ${filter}`} icon={<span>📦</span>} />
            </section>
          </div>

          {/* Orders list */}
          <section className="bg-white/5 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-6 p-3 bg-[#2c1810] rounded-xl">
              <div>
                <h2 className="text-2xl font-extrabold text-white/80 tracking-tight">
                  Recent Orders
                </h2>
                <p className="text-sm text-white/60 mt-1">Track your latest transactions</p>
              </div>
              <div className="text-sm px-3 py-1 bg-[#3d2317] rounded-lg text-white/80">
                {filteredOrders.length} shown
              </div>
            </div>

            {loading ? (
              <CoffeeLoading visible={loading} />
            ) : filteredOrders.length === 0 ? (
              <div className="py-12 text-center text-white/60">No orders match your filters.</div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {filteredOrders.map((o) => (
                  <OrderRow key={o.id} order={o} />
                ))}
              </div>
            )}
          </section>

          {/* Quick actions / small reports */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl p-4 bg-[#2c1810]">
              <div className="font-semibold">Sales breakdown</div>
              <div className="text-sm text-white/60 mt-2">Completed: {formatCurrency(totalSales)} • Orders: {ordersCompleted}</div>
            </div>

            <div className="rounded-2xl p-4 bg-[#2c1810]">
              <div className="font-semibold">Popular item</div>
              <div className="text-sm text-white/60 mt-2">{topSelling}</div>
            </div>

            <div className="rounded-2xl p-4 bg-[#2c1810]">
              <div className="font-semibold">Export</div>
              <div className="mt-3 flex gap-2">
                <button className="px-3 py-2 rounded-lg bg-amber-600 text-black font-semibold">CSV</button>
                <button className="px-3 py-2 rounded-lg bg-white/10">PDF</button>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Order modal */}
      {activeOrder && (
        <div className="bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#2c1810] rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-2xl font-bold">Order #{activeOrder.number}</div>
                <div className="text-sm text-white/70">{formatDate(activeOrder.created_at)}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1 rounded-full ${statusClass(activeOrder.status)}`}>{activeOrder.status}</div>
                <button onClick={() => setActiveOrder(null)} className="text-sm px-3 py-2 rounded-lg bg-white/5">Close</button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3">
              {activeOrder.order_products.map((p, i) => (
                <div key={i} className="flex items-center justify-between bg-[#3d2317] rounded-lg p-3">
                  <div>
                    <div className="font-semibold">{p.products.name}</div>
                    {p.products.description && <div className="text-xs text-white/70">{p.products.description}</div>}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(p.price)}</div>
                    <div className="text-xs text-white/70">x{p.quantity}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-right">
              <div className="text-sm text-white/70">Total</div>
              <div className="text-2xl font-bold">{formatCurrency(activeOrder.total_price)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
