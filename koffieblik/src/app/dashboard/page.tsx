"use client";
import { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface Order {
  id: string;
  number: number;
  order_number: number;
  paid_status:string,
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
  const [selectedTab, setSelectedTab] = useState("Dashboard");
  const [filter, setFilter] = useState("Today");
  const router = useRouter();
  const [username, setUsername] = useState("Guest");
  const [orders, setOrders] = useState<Order[]>([]);
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [loading, setLoading] = useState(true);
  const [offSetStart, setOffsetStart] = useState(0);
  const limit = 5;
  const [statusFilter, setStatusFilter] = useState("pending");
  const [topSelling, setTopSelling] = useState("N/A");
  const [totalAmount, settotalAmount] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [filteredOrdersTotal, setFilteredOrdersTotal] = useState(0);

  useEffect(() => {
    const now = new Date();
    if (filter === "Today") {
      const today = now.toISOString().split("T")[0];
      setStartDate(today);
      setEndDate(today);
    } else if (filter === "This Week") {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      const start = startOfWeek.toISOString().split("T")[0];
      const end = now.toISOString().split("T")[0];
      setStartDate(start);
      setEndDate(end);
    } else if (filter === "This Month") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const start = startOfMonth.toISOString().split("T")[0];
      const end = now.toISOString().split("T")[0];
      setStartDate(start);
      setEndDate(end);
    }
  }, [filter]);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/get_orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          start_Date: startDate,
          end_Date: endDate,
          offset: offSetStart,
          limit: limit,
          orderBy: "order_number",
          orderDirection: "asc",
          filters: { status: statusFilter },
        }),
      });
      const data = await response.json();
      if (response.ok) {
        const validated = data.orders.map((order: any) => ({
          ...order,
          paid_status: order.payments?.[0]?.status === "completed" ? "paid" : "unpaid",
        }));
        setOrders(validated);
        setTotalOrders(data.count);
        setFilteredOrdersTotal(data.filteredOrders);
        settotalAmount(data.sumFiltered);
        if (data.topProducts && data.topProducts.length > 0) {
          setTopSelling(data.topProducts[0].name);
        } else {
          setTopSelling("N/A");
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [offSetStart, statusFilter, startDate, endDate]);

  const dateInputStyle = "p-3 border-2 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all duration-200";

  const metrics = [
    { label: `Total ${statusFilter}`, value: `R ${totalAmount.toFixed(2)}` },
    { label: `Orders ${statusFilter}`, value: filteredOrdersTotal.toString() },
    { label: "Top Selling Product", value: topSelling },
    { label: "Total Orders", value: `${totalOrders}` },
  ];

  const getStatusStyle = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold";
    const normalized = (status || "").toLowerCase();
    switch (normalized) {
      case "completed":
      case "paid":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "cancelled":
      case "unpaid":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <main className="relative p-6">
      <div className="relative z-10">
        <div className="mb-8">
          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-2" style={{ color: "var(--primary-3)" }}>
              Dashboard
            </h1>
            <p className="text-sm opacity-70" style={{ color: "var(--primary-3)" }}>
              Overview of your coffee shop operations
            </p>
          </div>

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metrics.map((metric, index) => (
              <div key={index} className="p-6 rounded-xl shadow-lg backdrop-blur-sm hover:scale-105 transition-all duration-200" style={{ backgroundColor: "var(--primary-2)", border: "2px solid var(--primary-3)" }}>
                <h2 className="text-sm font-medium mb-2 opacity-70" style={{ color: "var(--primary-3)" }}>{metric.label}</h2>
                {loading ? (
                  <div className="text-xl" style={{ color: "var(--primary-3)" }}>Loading...</div>
                ) : (
                  <p className="text-3xl font-bold mb-1" style={{ color: "var(--primary-3)" }}>{metric.value}</p>
                )}
              </div>
            ))}
          </section>

          <div className="rounded-xl shadow-lg backdrop-blur-sm" style={{ backgroundColor: "var(--primary-2)", border: "2px solid var(--primary-3)" }}>
            <div className="p-6 border-b-2" style={{ borderColor: "var(--primary-3)" }}>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <h2 className="text-2xl font-bold" style={{ color: "var(--primary-3)" }}>Recent Orders</h2>
                <div className="flex flex-wrap gap-3 items-center">
                  <select className={dateInputStyle} style={{ backgroundColor: "var(--primary-4)", borderColor: "var(--primary-3)", color: "var(--primary-3)" }} value={filter} onChange={(e) => setFilter(e.target.value)}>
                    <option>Today</option>
                    <option>This Week</option>
                    <option>This Month</option>
                    <option>Custom Range</option>
                  </select>
                  {filter === "Custom Range" && (
                    <>
                      <input type="date" className={dateInputStyle} value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ backgroundColor: "var(--primary-4)", borderColor: "var(--primary-3)", color: "var(--primary-3)" }} />
                      <span className="font-medium" style={{ color: "var(--primary-3)" }}>to</span>
                      <input type="date" className={dateInputStyle} value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ backgroundColor: "var(--primary-4)", borderColor: "var(--primary-3)", color: "var(--primary-3)" }} />
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex gap-3">
                  {["pending", "completed", "cancelled"].map((status) => (
                    <button key={status} className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200" style={{ backgroundColor: statusFilter === status ? "var(--primary-2)" : "var(--primary-4)", color: statusFilter === status ? "var(--primary-1)" : "var(--primary-3)", border: "2px solid var(--primary-3)" }} onClick={() => { setStatusFilter(status); setOffsetStart(0); }}>
                      {status}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setOffsetStart((prev) => Math.max(prev - limit, 0))} disabled={offSetStart === 0} className="px-4 py-2 rounded-lg font-semibold transition-all duration-200" style={{ color: offSetStart === 0 ? "#9CA3AF" : "var(--primary-3)", backgroundColor: "var(--primary-4)", opacity: offSetStart === 0 ? 0.5 : 1, border: "2px solid var(--primary-3)" }}>←</button>
                  <span className="font-medium" style={{ color: "var(--primary-3)" }}>{offSetStart + 1} – {offSetStart + limit}</span>
                  <button onClick={() => setOffsetStart((prev) => prev + limit)} className="px-4 py-2 rounded-lg font-semibold transition-all duration-200" style={{ color: "var(--primary-3)", backgroundColor: "var(--primary-4)", border: "2px solid var(--primary-3)" }}>→</button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center" style={{ color: "var(--primary-3)" }}>Loading orders...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead style={{ backgroundColor: "var(--primary-4)" }}>
                    <tr>
                      {["Order #", "Items", "Total", "Status", "Paid", "Date"].map((header) => (
                        <th key={header} className="text-left px-6 py-4 font-semibold text-sm" style={{ color: "var(--primary-3)" }}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, index) => (
                      <tr key={order.id} className="border-t-2 hover:bg-opacity-50 transition-colors" style={{ borderColor: "var(--primary-3)" }}>
                        <td className="px-6 py-4 font-medium text-sm" style={{ color: "var(--primary-3)" }}>#{order.order_number}</td>
                        <td className="px-6 py-4 text-sm" style={{ color: "var(--primary-3)" }}>{order.order_products.map((p) => `${p.products.name} x${p.quantity}`).join(", ")}</td>
                        <td className="px-6 py-4 font-semibold text-sm" style={{ color: "var(--primary-3)" }}>R{order.total_price}</td>
                        <td className="px-6 py-4"><span className={getStatusStyle(order.status)}>{order.status}</span></td>
                        <td className="px-6 py-4"><span className={getStatusStyle(order.paid_status)}>{order.paid_status}</span></td>
                        <td className="px-6 py-4 text-sm" style={{ color: "var(--primary-3)" }}>{new Date(order.created_at).toLocaleDateString("en-ZA")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}