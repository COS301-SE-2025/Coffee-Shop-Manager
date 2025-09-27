"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Router } from "express";

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

  const [offSetStart, setOffsetStart] = useState(0);
  const limit = 5; // items per page
  const [statusFilter, setStatusFilter] = useState("pending");
  const router = useRouter();
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
          offset: offSetStart,
          limit: limit,
          orderBy: "created_at",
          orderDirection: "desc",
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
  return (
    <main
      className="min-h-screen p-8"
      style={{
        backgroundColor: "var(--primary-4)",
        color: "var(--primary-3)",
      }}
    >
      <h1 className="text-4xl font-bold mb-6">📦 Manage Orders</h1>

      {loading ? (
        <p className="text-gray-600">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-600">No orders found.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className={`rounded-xl shadow p-6 relative ${order.status === "completed"
                ? "bg-green-100"
                : order.status === "cancelled"
                  ? "bg-red-100"
                  : "bg-white"
                }`}
            >
              <h2 className="text-xl font-semibold mb-2">
                Order #{order.number}
              </h2>
              <p className="text-sm text-gray-500 mb-3">
                Placed on: {new Date(order.created_at).toLocaleString()}
              </p>
              <p className="mb-3 text-sm">
                Status:{" "}
                <span
                  className={`font-bold ${order.status === "pending"
                    ? "text-yellow-600"
                    : order.status === "completed"
                      ? "text-green-600"
                      : "text-red-600"
                    }`}
                >
                  {order.status.toUpperCase()}
                </span>
              </p>

              <ul className="mb-3">
                {order.order_products.map((item, idx) => (
                  <li key={idx} className="flex justify-between border-b py-1">
                    <span>
                      {item.products.name} x{item.quantity}
                    </span>
                    <span>R{item.price * item.quantity}</span>
                  </li>
                ))}
              </ul>

              <p className="font-bold mb-4">Total: R{order.total_price}</p>

              {/* 🟡 Buttons to update status */}
              {order.status === "pending" && (
                <div className="flex gap-4">
                  <button
                    className="btn bg-green-600 text-white hover:bg-green-700"
                    onClick={() => updateOrderStatus(order.id, "completed")}
                  >
                    ✅ Mark as Completed
                  </button>
                  <button
                    className="btn bg-red-600 text-white hover:bg-red-700"
                    onClick={() => updateOrderStatus(order.id, "cancelled")}
                  >
                    ❌ Cancel Order
                  </button>
                </div>
              )}

              {order.status === "completed" && (
                <div className="mt-4">
                  <button
                    className="btn bg-yellow-600 text-white hover:bg-yellow-700"
                    onClick={() => updateOrderStatus(order.id, "pending")}
                  >
                    🔄 Revert to Pending
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
