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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const dateInputStyle =
    "p-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200";
  const [customerName, setCustomerName] = useState("");
  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState("");
  const [offSetStart, setOffsetStart] = useState(0);
  const limit = 5; // items per page
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      router.replace("/login");
    }
  }, [router]);

  const getStatusStyle = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold";
    switch (status.toLowerCase()) {
      case "completed":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "cancelled":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/get_orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          offset: offSetStart,
          limit: limit,
          orderBy: "created_at",
          orderDirection: "desc",
          filters: {
            status: "pending",
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
      setLoading(false);
    }
  };

  //when the offsetStart changes it will refecth the function
  useEffect(() => {
    fetchOrders();
  }, [offSetStart]);


  // 🔄 run once on mount (or whenever API_BASE_URL changes)
  useEffect(() => {
    fetchOrders();
  }, [API_BASE_URL]);

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

  // Filter orders based on selected filter
  const now = new Date();
  let filteredOrders = orders;

  // if (filter === "Today") {
  //   filteredOrders = orders.filter(
  //     (order) =>
  //       new Date(order.created_at).toDateString() === now.toDateString(),
  //   );
  // } else if (filter === "This Week") {
  //   const startOfWeek = new Date(now);
  //   startOfWeek.setDate(now.getDate() - now.getDay());
  //   filteredOrders = orders.filter(
  //     (order) => new Date(order.created_at) >= startOfWeek,
  //   );
  // } else if (filter === "This Month") {
  //   const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  //   filteredOrders = orders.filter(
  //     (order) => new Date(order.created_at) >= startOfMonth,
  //   );
  // } else if (filter === "Custom Range" && startDate && endDate) {
  //   const start = new Date(startDate);
  //   const end = new Date(endDate);
  //   end.setHours(23, 59, 59, 999);

  //   filteredOrders = orders.filter((order) => {
  //     const orderDate = new Date(order.created_at);
  //     return orderDate >= start && orderDate <= end;
  //   });
  // }

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
    };
    // setLoading(true);
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
    <main
      className="min-h-screen p-8"
      style={{
        backgroundColor: "var(--primary-4)",
        color: "var(--primary-3)",
      }}
    >
      <h1 className="text-4xl font-bold mb-6">🧾 POS System</h1>

      {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Customer Name"
          className="p-3 rounded-lg w-full"
          style={{
            border: '1px solid var(--primary-3)',
            color: 'var(--primary-3)',
            backgroundColor: 'transparent',
          }}
        />
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="User ID / Cell Number"
          className="p-3 rounded-lg w-full"
          style={{
            border: '1px solid var(--primary-3)',
            color: 'var(--primary-3)',
            backgroundColor: 'transparent',
          }}
        />
      </div> */}
      <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
        {/* LEFT COLUMN (menu + cart stacked) */}
        <div style={{ flex: "0 0 50%", maxWidth: "50%", display: "flex", border: "2px solid var(--primary-3)", padding: "20px", flexDirection: "column", gap: "20px" }}>
          {/* Menu */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
            {loading ? (
              <div className="col-span-2 md:col-span-3 lg:col-span-4 flex justify-center items-center py-10">
                <Loader />
              </div>
            ) : (
              <>
                {menu.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => addToCart(item)}
                    className="rounded-xl p-4 hover:shadow-md"
                    style={{
                      backgroundColor: "var(--primary-2)",
                      border: "1px solid var(--primary-3)",
                      color: "var(--primary-3)",
                    }}
                  >
                    <h2 className="font-semibold text-lg">{item.name}</h2>
                    <p>R{item.price}</p>
                  </button>
                ))}
              </>
            )}
          </div>

          {/* Cart */}
          <div
            className="rounded-xl shadow-md p-6 mb-6"
            style={{
              backgroundColor: "var(--primary-2)",
            }}
          >
            <h2 className="text-xl font-bold mb-4">🛒 Cart</h2>
            {cart.length === 0 ? (
              <p className="text-red-500">Cart is empty.</p>
            ) : (
              <ul>
                {cart.map((item) => (
                  <li
                    key={item.id}
                    className="flex justify-between items-center mb-2"
                  >
                    <span>
                      {item.name} x{item.quantity}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-amber-700">
                        R{item.price * item.quantity}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                ))}
                <li className="font-bold mt-4">Total: R{total}</li>
              </ul>
            )}
            {message && <p className="mb-4 text-sm font-medium">{message}</p>}

            <button onClick={completeOrder} className="btn">

              Complete Order
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ flex: "0 0 50%", maxWidth: "50%", padding: "20px", border: "2px solid var(--primary-3)", overflowX: "auto" }}>
          {/* <h2 className="text-xl font-bold mb-4">📋 Recent Orders</h2>
          <table className="table-auto w-full border-collapse border border-gray-400 bg-white">
            <thead>
              <tr>
                <th className="border border-gray-400 px-4 py-2">Name</th>
                <th className="border border-gray-400 px-4 py-2">Quantity</th>
                <th className="border border-gray-400 px-4 py-2">Price</th>

              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-400 px-4 py-2">Latte</td>
                <td className="border border-gray-400 px-4 py-2">2</td>
                <td className="border border-gray-400 px-4 py-2">R60</td>
              </tr>
              <tr className="bg-gray-100">
                <td className="border border-gray-400 px-4 py-2">Cappuccino</td>
                <td className="border border-gray-400 px-4 py-2">1</td>
                <td className="border border-gray-400 px-4 py-2">R35</td>
              </tr>
            </tbody>
          </table> */}
          {loading ? (
            <Loader />
          ) : (
            <section
              className="backdrop-blur-sm border border-[var(--primary-2)] rounded-2xl shadow-xl"
              style={{ backgroundColor: "var(--primary-3)" }}
            >
              {/* Heading */}
              <div
                className="p-6 border-b-2"
                style={{
                  borderColor: "var(--primary-4)",
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

                  {/* Pagination controls */}
                  <div className="flex justify-end items-center gap-4 mt-4 px-6">
                    <button
                      onClick={() => setOffsetStart((prev) => Math.max(prev - limit, 0))}
                      disabled={offSetStart === 0}
                      className="px-3 py-1 rounded-lg border"
                      style={{
                        borderColor: "var(--primary-4)",
                        color: offSetStart === 0 ? "gray" : "var(--primary-2)",
                        backgroundColor: "var(--primary-3)",
                        opacity: offSetStart === 0 ? 0.5 : 1,
                      }}
                    >
                      ⬅ Prev
                    </button>

                    <span style={{ color: "var(--primary-2)" }}>
                      Showing {offSetStart + 1} – {offSetStart + limit}
                    </span>

                    <button
                      onClick={() => setOffsetStart((prev) => prev + limit)}
                      className="px-3 py-1 rounded-lg border"
                      style={{
                        borderColor: "var(--primary-4)",
                        color: "var(--primary-2)",
                        backgroundColor: "var(--primary-3)",
                      }}
                    >
                      Next ➡
                    </button>
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
          )}
        </div>

      </div>

    </main>
  );
}
