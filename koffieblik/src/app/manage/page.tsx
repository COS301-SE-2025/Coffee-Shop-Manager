"use client";

import React, { useEffect, useState } from "react";

import { useRouter } from "next/navigation";
import { FaCheck, FaTimes } from "react-icons/fa";
import CoffeeBackground from "assets/coffee-background";

interface OrderProduct {
  product_id: string;
  quantity: number;
  price: number;
  products: {
    name: string;
    description?: string;
    price: number;
  };
}

interface Order {
  id: string;
  number: number;
  order_number: number;
  paid_status: string,
  status: "pending" | "completed" | "cancelled";
  total_price: number;
  created_at: string;
  updated_at: string;
  order_products: OrderProduct[];
}

export default function ManageOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;


  const dateInputStyle =
    "p-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200";
  const [filter, setFilter] = useState("Today");

  const [offSetStart, setOffsetStart] = useState(0);
  const today = new Date().toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const limit = 5; // items per page
  const [statusFilter, setStatusFilter] = useState("pending");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

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

  const router = useRouter();
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

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      router.replace("/login");
    }
  }, [router]);

  const updateOrderStatus = async (
    orderId: string,
    newStatus: "completed" | "cancelled" | "pending",
  ) => {
    try {
      // Update order status
      const res = await fetch(`${API_BASE_URL}/update_order_status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ 
          order_id: orderId, 
          status: newStatus
        }),
      });

      const data = await res.json();

      // If order is completed, also update payment status
      if (data.success && newStatus === "completed") {
        // Call the dedicated payment API endpoint
        const paymentRes = await fetch(`${API_BASE_URL}/order/pay/${orderId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include"
        });
        
        const paymentData = await paymentRes.json();
        console.log("Payment status update:", paymentData.success ? "success" : "failed");
      }

      if (data.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId 
              ? { 
                  ...order, 
                  status: newStatus,
                  // Also update paid_status in local state
                  paid_status: newStatus === "completed" ? "paid" : order.paid_status 
                } 
            : order
          ),
        );
      } else {
        console.error(
          "❌ Failed to update order status:",
          data.message || data.error,
        );
      }
    } catch (err) {
      console.error("❌ Error updating status:", err);
    }
  };

  // useEffect(() => {
  //   const fetchOrders = async () => {
  //     try {
  //       const res = await fetch(`${API_BASE_URL}/get_orders`, {
  //         credentials: "include",
  //       });
  //       const data = await res.json();

  //       if (data.success) {
  //         const validated = data.orders.map((order: any) => ({
  //           ...order,
  //           status: order.status || "pending",
  //         }));
  //         setOrders(validated);
  //       } else {
  //         console.error(
  //           "❌ Failed to load orders:",
  //           data.message || data.error,
  //         );
  //       }
  //     } catch (err) {
  //       console.error("❌ Error fetching orders:", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchOrders();
  // }, []);
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
        // setTotalOrders(data.count);
        // setFilteredOrdersTotal(data.filteredOrders);
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
  // 🔄 run once on mount (or whenever API_BASE_URL changes)
  useEffect(() => {
    fetchOrders();
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchOrders();
  }, [offSetStart, statusFilter, startDate, endDate]);
  return (
    <main className="relative min-h-full bg-transparent overflow-x-hidden p-8">
      {/* Coffee Background */}
      <div className="fixed inset-0 z-0">
        <CoffeeBackground />
      </div>

      {/* Main content above background */}
      <div className="relative z-10">
        <h1
          className="text-4xl font-bold mb-6"
          style={{ color: "var(--primary-3)" }}
        >
          Manage Orders
        </h1>

        <div className="rounded-t-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 border-b-2" style={{
          borderColor: "var(--primary-4)",
          backgroundColor: "var(--primary-3)",
        }}>
          <div className="flex items-center gap-3">
            {/* <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "var(--primary-4)" }}
            >
              <span
                className="text-sm"
                style={{ color: "var(--primary-2)" }}
              >
                📋
              </span>
            </div> */}
            <h2
              className="text-2xl"
              style={{ color: "var(--primary-2)" }}
            >
              Recent Orders
            </h2>
          </div>
          <div
            className="p-6 border-b-2"
            style={{
              borderColor: "var(--primary-4)",
              backgroundColor: "var(--primary-3)",
            }}
          >
            {/* Heading */}


            {/* Top row: Pagination + Filter */}
            {/* Pagination controls */}
            <div className="flex justify-center items-center gap-3 w-full">
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
                ⬅
              </button>

              <span style={{ color: "var(--primary-2)" }}>
                {offSetStart + 1} – {offSetStart + limit}
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
                ➡
              </button>
            </div>


            {/* Status Buttons Row */}
            <div className="flex justify-start gap-3 mt-6">
              <button
                className="px-4 py-1 rounded-lg border text-xs font-medium"
                style={{
                  borderColor: "var(--primary-4)",
                  color: "var(--primary-2)",
                  backgroundColor: "var(--primary-3)",
                }}
                onClick={() => {
                  setStatusFilter("pending");
                  setOffsetStart(0);
                }}
              >
                pending
              </button>
              <button
                className="px-4 py-1 rounded-lg border text-xs font-medium"
                style={{
                  borderColor: "var(--primary-4)",
                  color: "var(--primary-2)",
                  backgroundColor: "var(--primary-3)",
                }}
                onClick={() => {
                  setStatusFilter("completed");
                  setOffsetStart(0);
                }}
              >
                completed
              </button>
              <button
                className="px-4 py-1 rounded-lg border text-xs font-medium"
                style={{
                  borderColor: "var(--primary-4)",
                  color: "var(--primary-2)",
                  backgroundColor: "var(--primary-3)",
                }}
                onClick={() => {
                  setStatusFilter("cancelled");
                  setOffsetStart(0);
                }}
              >
                cancelled
              </button>
            </div>
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

        {
          loading ? (
            <p className="text-gray-600">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="text-gray-600">No orders found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b"
                  style={{
                    backgroundColor: "var(--primary-3)",
                    borderColor: "var(--primary-2)",
                  }}>
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
                      Status
                    </th>
                    <th
                      className="text-left px-6 py-4 font-semibold"
                      style={{ color: "var(--primary-2)" }}
                    >
                      Paid
                    </th>
                    <th
                      className="text-left px-6 py-4 font-semibold"
                      style={{ color: "var(--primary-2)" }}
                    >
                      Date
                    </th>
                    {/* <th
                      className="text-left px-6 py-4 font-semibold"
                      style={{ color: "var(--primary-2)" }}
                    >
                      Items
                    </th> */}
                    <th
                      className="text-left px-6 py-4 font-semibold"
                      style={{ color: "var(--primary-2)" }}
                    >
                      Total
                    </th>


                    <th className="text-left px-6 py-4 font-semibold"
                      style={{ color: "var(--primary-2)" }}>
                      Actions
                    </th>

                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <React.Fragment key={order.id}>
                      {/* Main row */}
                      <tr
                        className={`border-b cursor-pointer ${order.status === "completed"
                          ? "bg-green-50"
                          : order.status === "cancelled"
                            ? "bg-red-50"
                            : "bg-white"
                          }`}
                        onClick={() => toggleExpand(order.id)}
                      >
                        <td className="p-3 font-semibold">#{order.order_number}</td>
                        <td className="p-3">
                          <span className={getStatusStyle(order.status)}>{order.status}</span>
                        </td>
                        <td className="p-3">
                          <span className={getStatusStyle(order.paid_status)}>{order.paid_status}</span>
                        </td>
                        <td className="p-3 text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleString()}
                        </td>
                        <td className="p-3 font-bold">R{order.total_price}</td>
                        <td className="p-3">
                          {order.status === "pending" && (
                            <div className="flex gap-2">
                              <button
                                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-700"
                                onClick={(e) => {
                                  e.stopPropagation(); // prevent row toggle
                                  updateOrderStatus(order.id, "completed");
                                }}
                              >
                                <FaCheck />
                              </button>
                              <button
                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateOrderStatus(order.id, "cancelled");
                                }}
                              >
                                <FaTimes />
                              </button>
                            </div>
                          )}
                          {order.status === "completed" && (
                            <button
                              className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateOrderStatus(order.id, "pending");
                              }}
                            >
                              🔄 Revert
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* Expanded items row */}
                      {expandedOrderId === order.id && (
                        <tr className="bg-gray-50">
                          <td colSpan={6} className="p-4">
                            <h4 className="font-semibold mb-2">🛒 Items</h4>

                            <ul className="list-disc list-inside space-y-1">
                              {order.order_products.map((item, idx) => (
                                <li key={idx}>
                                  {item.products.name} × {item.quantity} — R
                                  {(item.price * item.quantity).toFixed(2)}
                                </li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>

              </table>
            </div>
          )
        }
      </div>
    </main >
  );
}
