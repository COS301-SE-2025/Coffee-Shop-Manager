"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loader from "../loaders/loader";

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock_quantity: number;
}

interface Order {
  id: string;
  number: number;
  order_number: number;
  paid_status: string,
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

interface CartItem extends MenuItem {
  quantity: number;
}

export default function POSPage() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [filter, setFilter] = useState("Today");
  const today = new Date().toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const dateInputStyle =
    "p-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200";

  const [customerName, setCustomerName] = useState("");
  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState("");
  const [offSetStart, setOffsetStart] = useState(0);
  const limit = 5; // items per page
  const [statusFilter, setStatusFilter] = useState("pending");
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const now = new Date();

    if (filter === "Today") {
      const today = now.toISOString().split("T")[0];
      setStartDate(today);
      setEndDate(today);
    } else if (filter === "This Week") {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday as start
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
    } else if (filter === "Custom Range") {
      // do nothing: leave startDate/endDate as manually chosen
    }
  }, [filter]);

  const [toast, setToast] = useState<{
    orderId: string;
    prevStatus: string;
    newStatus: string;
  } | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      router.replace("/login");
    }
  }, [router]);

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

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const response = await fetch(`${API_BASE_URL}/get_orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          start_Date: startDate,
          end_Date: endDate,
          offset: offSetStart,
          limit: limit,
          orderBy: "order_number",
          orderDirection: "asc",
          filters: {
            status: statusFilter,
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Fetched data:", data);
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
      setLoadingOrders(false);
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    newStatus: "completed" | "cancelled" | "pending",
  ) => {
    const prevOrder = orders.find((o) => o.id === orderId);
    if (!prevOrder) return;

    try {
      const res = await fetch(`${API_BASE_URL}/update_order_status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ order_id: orderId, status: newStatus }),
      });

      const data = await res.json();

      if (data.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order,
          ),
        );

        setToast({ orderId, prevStatus: prevOrder.status, newStatus });

        setTimeout(() => {
          setToast(null);
          fetchOrders();
        }, 5000);

      } else {
        console.error("❌ Failed to update order status:", data.message || data.error);
      }
    } catch (err) {
      console.error("❌ Error updating status:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchOrders();
  }, [offSetStart, statusFilter, startDate, endDate]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/getProducts`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setMenu(data.products);
        } else {
          console.error("Failed to load products:", data.error);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const [userEmails, setUserEmails] = useState<string[]>([]);
  const [selectedEmail, setSelectedEmail] = useState("");

  useEffect(() => {
    const fetchUserEmails = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/user/emails`, {
          credentials: "include",
        });
        const data = await res.json();
        console.log("📧 User emails:", data.emails);
        setUserEmails(data.emails || []);
      } catch (err) {
        console.error("❌ Error fetching user emails:", err);
      }
    };

    fetchUserEmails();
  }, [API_BASE_URL]);

  let filteredOrders = orders;

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci,
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const completeOrder = async () => {
    if (cart.length === 0) {
      setMessage("Please add products to the cart first.");
      return;
    }

    const payload = {
      products: cart.map((item) => ({
        product: item.name,
        quantity: item.quantity,
      })),
      email: selectedEmail
    };

    try {
      const res = await fetch(`${API_BASE_URL}/create_order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setCart([]);
        setCustomerName("");
        setUserId("");
        setMessage("✅ Order successfully submitted!");
        fetchOrders();
      } else {
        setMessage(
          `❌ Failed to create order: ${result.message || "Unknown error"}`,
        );
      }
    } catch (err) {
      console.error("Order error:", err);
      setMessage("❌ Failed to submit order. Please try again.");
    }
  };

  return (
    <main className="relative min-h-full bg-transparent">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
              style={{ backgroundColor: "var(--primary-4)" }}
            >
              <span
                className="font-bold text-xl"
                style={{ color: "var(--primary-2)" }}
              >
                🛒
              </span>
            </div>
            <div>
              <h1
                className="text-3xl font-bold"
                style={{ color: "var(--primary-2)" }}
              >
                Point of Sale
              </h1>
              <p style={{ color: "var(--primary-2)" }}>
                Process orders and manage transactions
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT COLUMN - Menu & Cart */}
          <div className="space-y-6">
            {/* User Selection */}
            <div
              className="backdrop-blur-sm rounded-2xl shadow-xl border p-6"
              style={{
                backgroundColor: "var(--primary-3)",
                borderColor: "var(--primary-4)"
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "var(--primary-4)" }}
                >
                  <span
                    className="text-sm"
                    style={{ color: "var(--primary-2)" }}
                  >
                    👤
                  </span>
                </div>
                <h2
                  className="text-xl font-bold"
                  style={{ color: "var(--primary-2)" }}
                >
                  Customer Selection
                </h2>
              </div>

              <select
                value={selectedEmail}
                onChange={(e) => setSelectedEmail(e.target.value)}
                className="w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                style={{
                  backgroundColor: "var(--primary-3)",
                  borderColor: "var(--primary-4)",
                  color: "var(--primary-2)"
                }}
              >
                <option value="">-- Choose a customer --</option>
                {userEmails.map((email, idx) => (
                  <option key={idx} value={email}>
                    {email}
                  </option>
                ))}
              </select>

              {selectedEmail && (
                <div
                  className="mt-3 p-3 rounded-lg border"
                  style={{
                    backgroundColor: "var(--primary-4)",
                    borderColor: "var(--primary-2)"
                  }}
                >
                  <p
                    className="text-sm"
                    style={{ color: "var(--primary-2)" }}
                  >
                    Selected: <span className="font-semibold">{selectedEmail}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Menu Items */}
            <div
              className="backdrop-blur-sm rounded-2xl shadow-xl border p-6"
              style={{
                backgroundColor: "var(--primary-3)",
                borderColor: "var(--primary-4)"
              }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "var(--primary-4)" }}
                >
                  <span
                    className="text-sm"
                    style={{ color: "var(--primary-2)" }}
                  >
                    ☕
                  </span>
                </div>
                <h2
                  className="text-xl font-bold"
                  style={{ color: "var(--primary-2)" }}
                >
                  Menu Items
                </h2>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {menu.map((item) => (
                    <button
                      key={item.id}
                      data-testid="product-card"
                      onClick={() => addToCart(item)}
                      className="group rounded-xl p-4 border transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                      style={{
                        backgroundColor: "#F5F5DC",
                        borderColor: "var(--primary-2)",
                        color: "#8B4513"
                      }}
                    >
                      <div className="text-center">
                        <h3 className="font-semibold text-sm mb-1 text-amber-900">
                          {item.name}
                        </h3>
                        <p className="text-lg font-bold text-amber-800">
                          R{item.price}
                        </p>
                        <div className="mt-2 text-xs text-amber-700">
                          Stock: {item.stock_quantity}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cart */}
            <div
              className="backdrop-blur-sm rounded-2xl shadow-xl border p-6"
              style={{
                backgroundColor: "var(--primary-3)",
                borderColor: "var(--primary-4)"
              }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "var(--primary-4)" }}
                >
                  <span
                    className="text-sm"
                    style={{ color: "var(--primary-2)" }}
                  >
                    🛒
                  </span>
                </div>
                <h2
                  className="text-xl font-bold"
                  style={{ color: "var(--primary-2)" }}
                >
                  Shopping Cart
                </h2>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4 opacity-30">🛒</div>
                  <p style={{ color: "var(--primary-2)" }}>Cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 rounded-xl border"
                      style={{
                        backgroundColor: "#F5F5DC",
                        borderColor: "var(--primary-2)"
                      }}
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-amber-900">
                          {item.name}
                        </h4>
                        <p className="text-sm text-amber-800">
                          Qty: {item.quantity} × R{item.price}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-amber-900">
                          R{item.price * item.quantity}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors duration-200 flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}

                  <div
                    className="border-t pt-4"
                    style={{ borderColor: "var(--primary-2)" }}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <span
                        className="text-xl font-bold"
                        style={{ color: "var(--primary-2)" }}
                      >
                        Total:
                      </span>
                      <span
                        className="text-2xl font-bold"
                        style={{ color: "var(--primary-2)" }}
                      >
                        R{total}
                      </span>
                    </div>

                    {message && (
                      <div
                        className="mb-4 p-3 border rounded-lg"
                        style={{
                          backgroundColor: "var(--primary-4)",
                          borderColor: "var(--primary-2)"
                        }}
                      >
                        <p
                          className="text-sm"
                          style={{ color: "var(--primary-2)" }}
                        >
                          {message}
                        </p>
                      </div>
                    )}

                    <button
                      onClick={completeOrder}
                      className="w-full py-4 text-white font-bold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                      style={{ backgroundColor: "var(--primary-2)" }}
                    >
                      Complete Order
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN - Orders */}
          <div
            className="backdrop-blur-sm rounded-2xl shadow-xl border"
            style={{
              backgroundColor: "var(--primary-3)",
              borderColor: "var(--primary-4)"
            }}
          >
            {/* Header */}
            <div
              className="p-6 border-b"
              style={{ borderColor: "var(--primary-2)" }}
            >
              <div className="flex items-center gap-3 mb-6">
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

              {/* Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                {/* Pagination */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setOffsetStart((prev) => Math.max(prev - limit, 0))}
                    disabled={offSetStart === 0}
                    className="px-4 py-2 rounded-lg border transition-colors duration-200"
                    style={{
                      backgroundColor: offSetStart === 0 ? "var(--primary-4)" : "var(--primary-3)",
                      borderColor: "var(--primary-4)",
                      color: offSetStart === 0 ? "gray" : "var(--primary-2)",
                      opacity: offSetStart === 0 ? 0.5 : 1,
                    }}
                  >
                    ←
                  </button>
                  <span
                    className="font-medium"
                    style={{ color: "var(--primary-2)" }}
                  >
                    {offSetStart + 1} – {offSetStart + limit}
                  </span>
                  <button
                    onClick={() => setOffsetStart((prev) => prev + limit)}
                    className="px-4 py-2 rounded-lg border transition-colors duration-200"
                    style={{
                      backgroundColor: "var(--primary-3)",
                      borderColor: "var(--primary-4)",
                      color: "var(--primary-2)"
                    }}
                  >
                    →
                  </button>
                </div>

                {/* Filter */}
                <div className="flex flex-wrap gap-3">
                  <select
                    className={`${dateInputStyle}`}
                    style={{
                      backgroundColor: "var(--primary-3)",
                      borderColor: "var(--primary-4)",
                      color: "var(--primary-2)"
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
                          color: "var(--primary-2)"
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
                          color: "var(--primary-2)"
                        }}
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Status Filters */}
              <div className="flex gap-3 mt-6">
                {["pending", "completed", "cancelled"].map((status) => (
                  <button
                    key={status}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200`}
                    style={{
                      backgroundColor: statusFilter === status ? "var(--primary-2)" : "var(--primary-4)",
                      color: statusFilter === status ? "var(--primary-3)" : "var(--primary-2)"
                    }}
                    onClick={() => {
                      setStatusFilter(status);
                      setOffsetStart(0);
                    }}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Table */}
            <div className="p-6">
              {loadingOrders ? (
                <div className="flex justify-center items-center py-20">
                  <Loader />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr
                        className="border-b"
                        style={{ borderColor: "var(--primary-2)" }}
                      >
                        <th
                          className="text-left py-3 font-semibold"
                          style={{ color: "var(--primary-2)" }}
                        >
                          Order #
                        </th>
                        <th
                          className="text-left py-3 font-semibold"
                          style={{ color: "var(--primary-2)" }}
                        >
                          Items
                        </th>
                        <th
                          className="text-left py-3 font-semibold"
                          style={{ color: "var(--primary-2)" }}
                        >
                          Total
                        </th>
                        <th
                          className="text-left py-3 font-semibold"
                          style={{ color: "var(--primary-2)" }}
                        >
                          Status
                        </th>
                        <th
                          className="text-left py-3 font-semibold"
                          style={{ color: "var(--primary-2)" }}
                        >
                          Paid
                        </th>
                        <th
                          className="text-left py-3 font-semibold"
                          style={{ color: "var(--primary-2)" }}
                        >
                          Date
                        </th>
                        <th
                          className="text-left py-3 font-semibold"
                          style={{ color: "var(--primary-2)" }}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody
                      className="divide-y"
                      style={{ borderColor: "var(--primary-4)" }}
                    >
                      {filteredOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="hover:bg-opacity-50 transition-colors duration-200"
                          style={{
                            backgroundColor: "#F5F5DC"
                          }}
                        >
                          <td className="py-4 font-medium text-amber-900">
                            #{order.order_number}
                          </td>
                          <td className="py-4 text-amber-800">
                            {order.order_products
                              .map((p) => `${p.products.name} x${p.quantity}`)
                              .join(", ")}
                          </td>
                          <td className="py-4 font-semibold text-amber-900">
                            R{order.total_price}
                          </td>
                          <td className="py-4">
                            <span className={getStatusStyle(order.status)}>{order.status}</span>
                          </td>
                          <td className="py-4">
                            <span className={getStatusStyle(order.paid_status)}>{order.paid_status}</span>
                          </td>
                          <td className="py-4 text-amber-800">
                            {new Date(order.created_at).toLocaleDateString("en-ZA")}
                          </td>
                          <td className="py-4">
                            {order.status === "pending" && (
                              <div className="flex gap-2">
                                <button
                                  className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded-lg transition-colors duration-200"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateOrderStatus(order.id, "completed");
                                  }}
                                >
                                  Complete
                                </button>
                                <button
                                  className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg transition-colors duration-200"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateOrderStatus(order.id, "cancelled");
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                            {order.status === "completed" && (
                              <button
                                className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs rounded-lg transition-colors duration-200"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateOrderStatus(order.id, "pending");
                                }}
                              >
                                Revert
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className="fixed bottom-6 right-6 bg-gray-800 text-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-4 z-50">
            <span>
              Order <strong>{toast.orderId}</strong> marked as <strong>{toast.newStatus}</strong>
            </span>
            <button
              className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg transition-colors duration-200"
              onClick={() => {
                updateOrderStatus(toast.orderId, toast.prevStatus as any);
                setToast(null);
              }}
            >
              Undo
            </button>
          </div>
        )}
      </div>
    </main>
  );
}