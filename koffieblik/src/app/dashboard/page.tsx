"use client";
import { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getTabs } from "@/constants/tabs";
import Loader from "../loaders/loader";

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
  const [selectedTab, setSelectedTab] = useState("Dashboard");
  const [filter, setFilter] = useState("Today");
  const router = useRouter();
  const [username, setUsername] = useState("Guest");
  const [orders, setOrders] = useState<Order[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [offSetStart, setOffsetStart] = useState(0);
  const limit = 5; // items per page
  const [statusFilter, setStatusFilter] = useState("pending");

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      router.replace("/login");
    }
  }, [router]);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  // useEffect(() => {
  //   async function fetchOrders() {
  //     setLoading(true);
  //     try {
  //       const response = await fetch(`${API_BASE_URL}/get_orders`, {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         credentials: "include",
  //       });

  //       const data = await response.json();

  //       if (response.ok) {
  //         setOrders(data.orders);
  //       } else {
  //         console.warn(
  //           "⚠️ Failed to fetch orders:",
  //           data.error || "Unknown error",
  //         );
  //       }
  //     } catch (error) {
  //       console.error("❌ Network or server error:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }

  //   fetchOrders();
  // }, [API_BASE_URL]);

  const topSelling = "N/A"
  const [totalAmount, settotalAmount] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [filteredOrdersTotal, setFilteredOrdersTotal] = useState(0);

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
        setTotalOrders(data.count);
        setFilteredOrdersTotal(data.filteredOrders);
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
  //when the offsetStart changes it will refecth the function
  useEffect(() => {
    fetchOrders();
  }, [offSetStart, statusFilter]);


  

  // Route to different pages based on selected tab
  useEffect(() => {
    if (selectedTab === "Inventory") {
      router.push("/inventory");
    } else if (selectedTab === "pos") {
      router.push("/pos");
    } else if (selectedTab === "manage") {
      router.push("/manage");
    } else if (selectedTab === "Reports") {
      router.push("/reports");
    } else if (selectedTab === "Help") {
      router.push("/help");
    }
  }, [selectedTab, router]);

  const dateInputStyle =
    "p-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200";

  type Metric = {
    label: string;
    value: string;
    color?: string;
  };

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

  // Calculate metrics
  //create API calls for these
  // const totalAmount = 0;

  // const ordersTotal = 0;









  const metrics: Metric[] = [
    {
      label: "Total " + `${statusFilter}(R)`,
      value: `R${totalAmount.toFixed(2)}`,
      color: "var(--primary-2)",
    },
    {
      label: "Orders " + `${statusFilter}`,
      value: filteredOrdersTotal.toString(),
      color: "var(--primary-2)",
    },
    {
      label: "Top Selling Product",
      value: topSelling,
      color: "var(--primary-2)",
    },
    {
      label: "Total Orders",
      value: `${totalOrders}`,
      color: "var(--primary-2)",
    },
  ];

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

  return (
    <main className="relative min-h-full bg-transparent">
      {/* Page Content */}
      <div className="p-8">
        {selectedTab === "Dashboard" && (
          <>
            {/* Metrics Section */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {metrics.map((metric, index) => (
                <div
                  key={index}
                  className="backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-[var(--primary-4)]"
                  style={{ backgroundColor: "var(--primary-3)" }}
                >
                  <h2 className="text-sm mb-2 font-medium text-[var(--primary-2)]">
                    {metric.label}
                  </h2>
                  {loading ? (
                    <Loader />
                  ) : (
                    <p
                      className="text-3xl font-bold"
                      style={{ color: metric.color }}
                    >
                      {metric.value}
                    </p>
                  )}
                  <div
                    className="mt-3 h-1 rounded-full"
                    style={{ backgroundColor: "var(--primary-4)" }}
                  ></div>
                </div>
              ))}
            </section>

            {/* Orders Section */}
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
            </div>
            {loading ? (
              <Loader />
            ) : (
              <section
                className="backdrop-blur-sm border border-[var(--primary-2)] rounded-2xl shadow-xl"
                style={{ backgroundColor: "var(--primary-3)" }}
              >
                {/* Heading */}


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
          </>
        )}

        {selectedTab === username && (
          <div className="max-w-md mx-auto">
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-400 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg">👤</span>
                </div>
                <h2 className="text-2xl font-bold text-amber-900">
                  Update Profile
                </h2>
              </div>

              <form
                onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const newUsername = formData.get("newUsername") as string;
                  const email = localStorage.getItem("email");

                  if (!email) {
                    alert("Missing email. Please log out and log in again.");
                    return;
                  }

                  try {
                    const response = await fetch("/api/API", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        action: "change_Username",
                        email: localStorage.getItem("email"),
                        username: newUsername,
                      }),
                    });
                    const result = await response.json();
                    if (result.success) {
                      alert("Username updated successfully!");
                      localStorage.setItem("username", result.user.username);
                      location.reload();
                    } else {
                      alert(result.message || "Failed to update username.");
                    }
                  } catch (error) {
                    console.error(error);
                    alert("Something went wrong.");
                  }
                }}
              >
                <label className="block mb-3 font-semibold text-amber-900">
                  New Username:
                </label>
                <input
                  type="text"
                  name="newUsername"
                  required
                  className="w-full p-4 border border-amber-300 rounded-xl mb-6 focus:outline-none focus:ring-3 focus:ring-amber-300 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your new username"
                />
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  Update Username
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
