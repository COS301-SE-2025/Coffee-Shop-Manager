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

interface CartItem extends MenuItem {
  quantity: number;
}

export default function POSPage() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      router.replace("/login");
    }
  }, [router]);

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
        <div style={{ flex: "0 0 50%", maxWidth: "50%", display: "flex", border: "2px solid var(--primary-3)",padding: "20px",flexDirection: "column", gap: "20px" }}>
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
        <div style={{ flex: "0 0 50%", maxWidth: "50%", padding: "20px", border: "2px solid var(--primary-3)",overflowX: "auto" }}>
          <h2 className="text-xl font-bold mb-4">📋 Recent Orders</h2>
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
          </table>
        </div>

      </div>

    </main>
  );
}
