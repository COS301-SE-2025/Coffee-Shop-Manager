"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CoffeeBackground from "assets/coffee-background";

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  stock_quantity?: number;
  available_quantity?: number | null;
}

interface CartItem extends MenuItem {
  quantity: number;
}

interface OrderSummary {
  items: CartItem[];
  subtotal: number;
  total: number;
}

export default function OrderPage() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [orderStatus, setOrderStatus] = useState<
    "ordering" | "selecting-payment" | "confirming" | "placed"
  >("ordering");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"card" | "cash" | null>(null);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    email: "",
    notes: specialInstructions
  });
  const [userPoints, setUserPoints] = useState(0);
  const router = useRouter();

  // Helper: create order and translate stock errors into friendly messages
  async function createOrderRequest(payload: any): Promise<{ ok: boolean; error?: string; result?: any }> {
    try {
      const res = await fetch(`${API_BASE_URL}/create_order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) return { ok: true, result: data };

      // If error mentions stock id, fetch stock item to get name
      const stockIdMatch = (data.error || "").match(/Not enough stock for item ([0-9a-fA-F-]{36})/);
      if (stockIdMatch) {
        const stockId = stockIdMatch[1];
        try {
          const stockRes = await fetch(`${API_BASE_URL}/stock/${stockId}`, { credentials: "include" });
          const stockData = await stockRes.json();
          if (stockRes.ok && stockData.stock) {
            return { ok: false, error: `Not enough ${stockData.stock.item} to complete order` };
          }
        } catch (err) {
          // fall through to generic error
        }
      }

      return { ok: false, error: data.error || data.message || "Failed to create order" };
    } catch (err: any) {
      return { ok: false, error: err.message || "Network error" };
    }
  }

  useEffect(() => {
  setCustomerInfo((prev) => ({
    ...prev,
    name: typeof window !== "undefined" ? localStorage.getItem("username") || "" : "",
    email: typeof window !== "undefined" ? localStorage.getItem("email") || "" : "",
  }));
}, []);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // const userId = localStorage.getItem("user_id");
  let userId: string | null = null;

  if (typeof window !== "undefined") {
    userId = localStorage.getItem("user_id");
  }

  // IMPORTANT: All useEffect hooks must be at the top level, before any conditional returns
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "user") {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // fetch products with ingredients and available_quantity
        const res = await fetch(`${API_BASE_URL}/product/stock`, {
          credentials: "include",
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setMenu(data);
        } else if (data.success && data.products) {
          setMenu(data.products);
        } else {
          console.error(
            "Failed to load products:",
            data.error || "No products found",
          );
          setMenu([]);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setMenu([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [API_BASE_URL]);

  // Combined effect to handle all PayFast return scenarios
  useEffect(() => {
    const checkPayment = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const payfastReturn = urlParams.get('payfast_return');
      const orderIdFromUrl = urlParams.get('order');

      if (payfastReturn === 'success' && orderIdFromUrl) {
        try {
          // Fetch order/payment status from backend
          const res = await fetch(`${API_BASE_URL}/order/${orderIdFromUrl}`, {
            credentials: 'include'
          });
          const data = await res.json();

          if (res.ok && data?.order) {
            let payment: any = undefined;
            if (Array.isArray(data.order.payments)) {
              payment = data.order.payments[0];
            } else if (data.order.payments && typeof data.order.payments === "object") {
              payment = data.order.payments;
            }

            const completed = payment?.status === "completed";

            if (completed) {
              setOrderStatus("placed");
              setSelectedPaymentMethod(payment?.method === "cash" ? "cash" : "card");
              setMessage("Payment successful! Your order has been paid.");
            } else {
              setMessage("Payment received, but order is not marked as paid yet. Please contact support.");
            }
          } else {
            setMessage("Error checking payment status. Please contact support.");
          }

          localStorage.removeItem("pendingOrder");
          localStorage.removeItem("paymentInitiated");
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (err) {
          setMessage("Error checking payment status. Please contact support.");
        }
      }

      if (payfastReturn === 'cancelled') {
        setOrderStatus("ordering");
        setMessage("Payment was cancelled. Please try again or choose a different payment method.");
        localStorage.removeItem("pendingOrder");
        localStorage.removeItem("paymentInitiated");
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    if (window.location.search.includes('payfast_return')) {
      checkPayment();
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    const fetchUserPoints = async () => {
      if (!userId) return;
      
      try {
        const response = await fetch(`${API_BASE_URL}/user`, {
          credentials: "include",
        });
        const data = await response.json();
        if (response.ok && data.success) {
          setUserPoints(data.profile.loyalty_points);
        }
      } catch (err) {
        console.error("Failed to fetch user points:", err);
      }
    };

    fetchUserPoints();
  }, [userId, API_BASE_URL]);

  const addToCart = (item: MenuItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === itemId);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map((cartItem) =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem,
        );
      } else {
        return prevCart.filter((cartItem) => cartItem.id !== itemId);
      }
    });
  };

  const getCartItemQuantity = (itemId: string): number => {
    const item = cart.find((cartItem) => cartItem.id === itemId);
    return item ? item.quantity : 0;
  };

  const getOrderSummary = (): OrderSummary => {
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const total = subtotal;

    return {
      items: cart,
      subtotal,
      total,
    };
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      setMessage("Please add items to your cart first.");
      return;
    }

    setMessage("");

    // Validate cart against stock before proceeding to payment selection
    try {
      const validateRes = await fetch(`${API_BASE_URL}/order/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ products: cart.map((c) => ({ product: c.id, quantity: c.quantity })) }),
      });
      const validateResult = await validateRes.json();

      if (validateRes.ok && validateResult && !validateResult.allOk) {
        // Adjust cart to allowed quantities
        const adjustments: Record<string, number> = {};
        for (const a of validateResult.adjustments || []) {
          adjustments[a.product_id || a.product] = a.allowed;
        }
        setCart((prev) =>
          prev
            .map((ci) => ({ ...ci, quantity: adjustments[ci.id] ?? ci.quantity }))
            .filter((ci) => ci.quantity > 0),
        );
        setMessage("Cart adjusted to available stock quantities. Please review before placing the order.");
        setOrderStatus("ordering");
        return;
      }

      // allOk -> proceed to payment selection
      setOrderStatus("selecting-payment");
    } catch (err) {
      console.error("Validation error:", err);
      setMessage("Failed to validate cart. Please try again.");
      setOrderStatus("ordering");
    }
  };

  const handlePaymentMethodSelect = async (paymentMethod: "card" | "cash") => {
    setSelectedPaymentMethod(paymentMethod);
    
    if (paymentMethod === "card") {
      // Validate required fields first
      if (!customerInfo.name || !customerInfo.email) {
        setMessage("Please fill in your name and email for card payment");
        return;
      }

      setOrderStatus("confirming");

      try {
        // First create the order
        const orderPayload = {
          products: cart.map((item) => ({
            product: item.name,
            quantity: item.quantity,
          })),
          custom: specialInstructions,
          payment_method: paymentMethod,
        };

        const createResult = await createOrderRequest(orderPayload);
        if (!createResult.ok) {
          setOrderStatus("ordering");
          setMessage(createResult.error ?? "Failed to create order");
          return;
        }

        const orderResult = createResult.result;
        console.log("Order created:", orderResult); // Debug log

        // Then initiate PayFast payment - add custom return URL with parameter
        const paymentPayload = {
          orderNumber: orderResult.order_id,
          total: getOrderSummary().total,
          customerInfo: {
            name: customerInfo.name,
            phone: customerInfo.phone || "",
            email: customerInfo.email,
            notes: specialInstructions || ""
          },
          // Add these custom return URLs with parameters
          returnUrl: `${window.location.origin}/userPOS?payfast_return=success&order=${orderResult.order_id}`,
          cancelUrl: `${window.location.origin}/userPOS?payfast_return=cancelled&order=${orderResult.order_id}`
        };

        console.log("Payment payload:", paymentPayload); // Debug log

        const paymentRes = await fetch(`${API_BASE_URL}/initiate-payment`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify(paymentPayload),
        });

        const paymentResult = await paymentRes.json();
        console.log("Payment result:", paymentResult); // Debug log

        if (!paymentRes.ok || !paymentResult.success) {
          throw new Error(paymentResult.message || "Failed to initiate payment");
        }

        // Store order info before redirect
        localStorage.setItem("pendingOrder", orderResult.order_id);
        localStorage.setItem("paymentInitiated", Date.now().toString());

        // Redirect to PayFast payment page
        window.location.href = paymentResult.paymentUrl;

      } catch (err) {
        console.error("Payment error:", err);
        setOrderStatus("ordering");
        setMessage("Failed to process payment. Please try again.");
      }
      return;
    }

    // For cash payments, just create the order and show success
    if (paymentMethod === 'cash') {
      const payload = {
        products: cart.map((item) => ({
          product: item.name,
          quantity: item.quantity,
        })),
        custom: specialInstructions,
      };

      try {
        const createResult = await createOrderRequest(payload);
        if (createResult.ok) {
          setOrderStatus("placed");
          setCart([]);
          setMessage("Order created! Please proceed to the counter to pay.");
        } else {
          setOrderStatus("ordering");
          setMessage(createResult.error ?? "Failed to create order");
        }
      } catch (err) {
        console.error("Order error:", err);
        setOrderStatus("ordering");
        setMessage("Failed to submit order. Please try again.");
      }
      return;
    }
  };

  const handleCancelPayment = () => {
    setOrderStatus("ordering");
    setSelectedPaymentMethod(null);
  };

  // Replace category filtering with search filtering
  const filteredItems = menu.filter((item) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      (item.description && item.description.toLowerCase().includes(query)) ||
      (item.category && item.category.toLowerCase().includes(query))
    );
  });

  const orderSummary = getOrderSummary();

  // Payment Method Selection Modal
  if (orderStatus === "selecting-payment") {
    async function handlePayWithPoints(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): Promise<void> {
      event.preventDefault();
      if (userPoints < Math.round(orderSummary.total * 100)) {
        setMessage("You do not have enough points to pay for this order.");
        return;
      }
      setMessage("");
      setOrderStatus("confirming");
      try {
        const payload = {
          products: cart.map((item) => ({
            product: item.name,
            quantity: item.quantity,
          })),
          custom: specialInstructions,
          payment_method: "points",
        };
        const createResult = await createOrderRequest(payload);
        if (createResult.ok) {
          const result = createResult.result;
          // First deduct points
          const pointsRes = await fetch(`${API_BASE_URL}/user/points`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              points: Math.round(orderSummary.total * 100),
              order_id: result.order_id,
            }),
          });
          const pointsResult = await pointsRes.json();
          
          if (pointsRes.ok && pointsResult.success) {
            setUserPoints((prev) => prev - Math.round(orderSummary.total * 100));
            setOrderStatus("placed");
            setCart([]);
            setSelectedPaymentMethod(null);
            setMessage("Order placed and paid with loyalty points!");
          } else {
            setOrderStatus("ordering");
            setMessage("Order created, but failed to redeem points. Please contact support.");
          }
        } else {
          setOrderStatus("ordering");
          setMessage(createResult.error ?? "Failed to create order");
        }
      } catch (err) {
        setOrderStatus("ordering");
        setMessage("Failed to process points payment. Please try again.");
      }
    }

    return (
      <div className="min-h-screen w-full overflow-y-auto"> {/* Added overflow-y-auto */}
        <div className="fixed inset-0 w-full h-full">
          <CoffeeBackground />
        </div>

        <div className="fixed inset-0 z-10 flex items-start justify-center p-4 overflow-y-auto"> 
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 relative z-20 mt-[200px]"> {/* Changed my-4 to mt-[200px] */}
            <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: "var(--primary-3)" }}>
              Choose Payment Method
            </h2>

            {/* Add message display */}
            {message && (
              <div className={`mb-4 p-3 rounded-lg ${
                message.includes("Failed") || message.includes("error")
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}>
                {message}
              </div>
            )}

            {/* Rest of the payment form */}
            <div className="space-y-3 mt-4 p-4 border-2 rounded-lg" style={{ borderColor: "var(--primary-4)" }}>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--primary-3)" }}>
                  Name
                </label>
                <input
                  type="text"
                  value={customerInfo.name ?? ""}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{ 
                    borderColor: "var(--primary-4)",
                    color: "var(--primary-3)",
                  }}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--primary-3)" }}>
                  Email
                </label>
                <input
                  type="email"
                  value={customerInfo.email ?? ""}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{ 
                    borderColor: "var(--primary-4)",
                    color: "var(--primary-3)",  // Add this line
                  }}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--primary-3)" }}>
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  style={{ 
                    borderColor: "var(--primary-4)",
                    color: "var(--primary-3)",  // Add this line
                  }}
                />
              </div>
            </div>
            
            <div className="space-y-4 mb-6 mt-6">  {/* Add mt-6 here */}
              <button
                onClick={() => {
                  if (!customerInfo.name || !customerInfo.email) {
                    setMessage("Please fill in your details for card payment");
                    return;
                  }
                  handlePaymentMethodSelect("card");
                }}
                className="w-full p-4 border-2 rounded-lg hover:shadow-md transition-all duration-200 flex items-center justify-center space-x-3"
                style={{
                  borderColor: "var(--primary-4)",
                  backgroundColor: "white",
                  color: "var(--primary-3)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--primary-4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span className="text-lg font-semibold">Card Payment</span>
              </button>

              <button
                onClick={() => handlePaymentMethodSelect("cash")}
                className="w-full p-4 border-2 rounded-lg hover:shadow-md transition-all duration-200 flex items-center justify-center space-x-3"
                style={{
                  borderColor: "var(--primary-4)",
                  backgroundColor: "white",
                  color: "var(--primary-3)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--primary-4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-lg font-semibold">Cash Payment</span>
              </button>

              {/* Add Loyalty Points Button */}
              <button
                onClick={handlePayWithPoints}
                className="w-full p-4 border-2 rounded-lg hover:shadow-md transition-all duration-200 flex items-center justify-center space-x-3"
                style={{
                  borderColor: "var(--primary-4)",
                  backgroundColor: "white",
                  color: "var(--primary-3)",
                }}
                disabled={userPoints < Math.round(orderSummary.total * 100)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-lg font-semibold">Pay with Points ({Math.round(orderSummary.total * 100)} points)</span>
              </button>
            </div>

            <div className="text-center">
              <p className="text-lg font-semibold mb-2" style={{ color: "var(--primary-3)" }}>
                Total: R{orderSummary.total.toFixed(2)}
              </p>
              <p className="text-sm mb-4" style={{ color: "var(--primary-3)" }}>
                Available Points: {userPoints}
              </p>
              
              <button
                onClick={handleCancelPayment}
                className="text-gray-500 hover:text-gray-700 underline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Processing state
  if (orderStatus === "confirming") {
    return (
      <div className="min-h-screen relative">
        <div className="fixed inset-0 z-0 h-screen">
          <CoffeeBackground />
        </div>

        <div className="min-h-screen flex justify-center items-center relative z-10">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: "var(--primary-3)" }}></div>
            <h2
              className="text-2xl font-bold mb-2"
              style={{ color: "var(--primary-3)" }}
            >
              Processing Your Order
            </h2>
            <p className="text-gray-600">
              Payment method: {selectedPaymentMethod === "card" ? "Card" : "Cash"}
            </p>
            <p className="text-gray-600">Please wait...</p>
          </div>
        </div>
      </div>
    );
  }

  if (orderStatus === "placed") {
    return (
      <div className="min-h-screen relative">
        <div className="fixed inset-0 z-0 h-screen">
          <CoffeeBackground />
        </div>

        <div className="min-h-screen flex justify-center relative z-10 pt-20">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg h-fit">
            <div className="mb-4">
              <span className="text-6xl">✓</span>
            </div>
            <h2
              className="text-2xl font-bold mb-2"
              style={{ color: "var(--primary-3)" }}
            >
              Order Placed Successfully!
            </h2>
            <p className="text-gray-600 mb-2">
              Your order is being prepared. You can track it in your dashboard.
            </p>
            <p className="text-gray-500 mb-4">
              Payment method: {selectedPaymentMethod === "card" ? "Card" : "Cash"}
            </p>
            {message && <p className="text-green-600 mb-4">{message}</p>}
            <div className="space-y-3">
              <button
                onClick={() => router.push("/userdashboard")}
                className="btn bg-blue-500 hover:bg-blue-600"
              >
                View Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0 h-screen">
        <CoffeeBackground />
      </div>

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {message && (
            <div
              className={`mb-4 p-3 rounded-lg ${
                message.includes("Failed") || message.includes("error")
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {message}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-xl" style={{ color: "var(--primary-3)" }}>
                Loading menu...
              </div>
            </div>
          ) : (
            <div className="lg:grid lg:grid-cols-3 lg:gap-8">
              <div className="lg:col-span-2">
                <div className="mb-8">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search for items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-3 pl-10 rounded-lg border-2"
                      style={{
                        borderColor: "var(--primary-4)",
                        backgroundColor: "white",
                        color: "var(--primary-3)",
                      }}
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                  {searchQuery && (
                    <p className="mt-2 text-sm text-gray-600">
                      {filteredItems.length} item
                      {filteredItems.length !== 1 ? "s" : ""} found for "
                      {searchQuery}"
                    </p>
                  )}
                </div>

                {/* Menu Items */}
                {filteredItems.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      {searchQuery
                        ? `No items found matching "${searchQuery}"`
                        : "No items available."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredItems.map((item) => {
                      const quantity = getCartItemQuantity(item.id);
                      return (
                        <div
                          key={item.id}
                          className="bg-white rounded-lg shadow-md overflow-hidden border"
                          style={{ borderColor: "var(--primary-4)" }}
                        >
                          <div className="p-6">
                            <div className="flex justify-between items-start mb-3">
                              <h3
                                className="text-xl font-semibold"
                                style={{ color: "var(--primary-3)" }}
                              >
                                {item.name}
                              </h3>
                              <div
                                className="flex items-center"
                                style={{ color: "var(--primary-3)" }}
                              >
                                <span className="text-lg font-bold">
                                  R{item.price.toFixed(2)}
                                </span>
                              </div>
                            </div>
                            {item.description && (
                              <p className="text-gray-600 mb-4">
                                {item.description}
                              </p>
                            )}

                            <div className="flex items-center justify-between">
                              {quantity === 0 ? (
                                <button
                                  onClick={() => addToCart(item)}
                                  className="btn flex-1"
                                  disabled={item.available_quantity === 0}
                                >
                                  <span className="mr-2">+</span>
                                  {item.available_quantity === 0
                                    ? "Out of Stock"
                                    : "Add to Cart"}
                                </button>
                              ) : (
                                <div className="flex items-center space-x-3 flex-1">
                                  <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="w-8 h-8 rounded-full flex items-center justify-center"
                                    style={{
                                      backgroundColor: "var(--primary-4)",
                                      color: "var(--primary-3)",
                                    }}
                                  >
                                    <span className="text-lg font-bold">−</span>
                                  </button>
                                  <span
                                    className="font-semibold text-lg min-w-[2rem] text-center"
                                    style={{ color: "var(--primary-3)" }}
                                  >
                                    {quantity}
                                  </span>
                                  <button
                                    onClick={() => addToCart(item)}
                                    className="w-8 h-8 rounded-full flex items-center justify-center"
                                    style={{
                                      backgroundColor: "var(--primary-3)",
                                      color: "var(--primary-2)",
                                    }}
                                    disabled={
                                      item.available_quantity != null &&
                                        quantity >= (item.available_quantity as number)
                                    }
                                  >
                                    <span className="text-lg font-bold">+</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Cart/Order Summary */}
              <div className="lg:col-span-1 mt-8 lg:mt-0">
                <div className="sticky top-[150px]">
                  <div
                    className="bg-white rounded-lg shadow-lg border"
                    style={{ borderColor: "var(--primary-4)" }}
                  >
                    <div className="p-6">
                      <h3
                        className="text-xl font-semibold mb-4"
                        style={{ color: "var(--primary-3)" }}
                      >
                        Your Order{" "}
                        {cart.length > 0 &&
                          `(${cart.reduce((sum, item) => sum + item.quantity, 0)} items)`}
                      </h3>

                      {cart.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">
                          Your cart is empty
                        </p>
                      ) : (
                        <>
                          <div className="space-y-3 mb-6">
                            {cart.map((item) => (
                              <div
                                key={item.id}
                                className="flex justify-between items-center py-2 border-b"
                                style={{ borderColor: "var(--primary-4)" }}
                              >
                                <div className="flex-1">
                                  <h4
                                    className="font-medium"
                                    style={{ color: "var(--primary-3)" }}
                                  >
                                    {item.name}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    Qty: {item.quantity}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p
                                    className="font-semibold"
                                    style={{ color: "var(--primary-3)" }}
                                  >
                                    R{(item.price * item.quantity).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Special Instructions Section */}
                          <div className="mb-6">
                            <label
                              htmlFor="special-instructions"
                              className="block text-sm font-medium mb-2"
                              style={{ color: "var(--primary-3)" }}
                            >
                              Special Instructions
                            </label>
                            <textarea
                              id="special-instructions"
                              rows={3}
                              placeholder="Any special requests for the barista?"
                              value={specialInstructions}
                              onChange={(e) => setSpecialInstructions(e.target.value)}
                              className="w-full px-3 py-2 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-opacity-50"
                              style={{
                                borderColor: "var(--primary-4)",
                                backgroundColor: "white",
                                color: "var(--primary-3)",
                              }}
                            />
                          </div>

                          <div className="space-y-2 mb-6">
                            <div className="flex justify-between">
                              <span>Subtotal:</span>
                              <span>R{orderSummary.subtotal.toFixed(2)}</span>
                            </div>
                            <div
                              className="flex justify-between font-bold text-lg border-t pt-2"
                              style={{
                                borderColor: "var(--primary-4)",
                                color: "var(--primary-3)",
                              }}
                            >
                              <span>Total:</span>
                              <span>R{orderSummary.total.toFixed(2)}</span>
                            </div>
                          </div>

                          <button
                            onClick={handlePlaceOrder}
                            className="btn w-full text-lg py-3"
                          >
                            Place Order
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
