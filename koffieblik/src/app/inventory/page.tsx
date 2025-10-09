"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CoffeeBackground from "assets/coffee-background";
import CoffeeLoading from "assets/loading";

interface InventoryItem {
  id: string;
  item: string;
  quantity: number;
  unit_type: string;
  max_capacity: number | null;
  reserved_quantity: number;
  percentage_left: number | null;
}

interface FailedItem {
  idOrItem: string;
  reason: string;
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const [formData, setFormData] = useState({
    item: "",
    id: "",
    quantity: "",
    unit_type: "",
    max_capacity: "",
    reserved_quantity: "",
  });

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/get_stock`, {
          credentials: "include",
        });
        const data = await response.json();
        if (data.success) {
          setItems(data.stock);
        } else {
          console.error("Failed to fetch stock.");
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStock();
  }, [API_BASE_URL]);

  const handleSubmit = async () => {
    if (!formData.item || !formData.quantity || !formData.unit_type) {
      alert("Please fill in item, quantity, and unit type");
      return;
    }

    const payload = {
      item: formData.item,
      quantity: parseInt(formData.quantity),
      unit_type: formData.unit_type,
      max_capacity: formData.max_capacity
        ? parseInt(formData.max_capacity)
        : null,
      reserved_quantity: formData.reserved_quantity
        ? parseInt(formData.reserved_quantity)
        : 0,
    };

    try {
      const method = isUpdating ? "PUT" : "POST";
      const response = await fetch(`${API_BASE_URL}/stock`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          id: formData.id || undefined,
          ...payload,
          reference: "manual update",
        }),
      });

      const result = await response.json();

      if (result.success) {
        if (isUpdating) {
          setItems((prev) =>
            prev.map((i) =>
              i.item === payload.item
                ? {
                    ...i,
                    ...payload,
                    percentage_left: payload.max_capacity
                      ? Math.round(
                          (payload.quantity / payload.max_capacity) * 100,
                        )
                      : null,
                  }
                : i,
            ),
          );
        } else {
          alert(`Added: ${result.createdItem}`);
          setItems((prev) => [
            ...prev,
            {
              ...payload,
              id: crypto.randomUUID(),
              percentage_left: payload.max_capacity
                ? Math.round((payload.quantity / payload.max_capacity) * 100)
                : null,
              max_capacity: payload.max_capacity ?? null,
              reserved_quantity: payload.reserved_quantity ?? 0,
            },
          ]);
        }

        setFormData({
          item: "",
          id: "",
          quantity: "",
          unit_type: "",
          max_capacity: "",
          reserved_quantity: "",
        });
        setIsUpdating(false);
        setShowForm(false);
      } else {
        alert(
          `❌ Failed: ${result.failedItems?.map((f: FailedItem) => `${f.idOrItem}: ${f.reason}`).join(", ")}`,
        );
      }
    } catch (err) {
      console.error(err);
      alert("❌ An error occurred while submitting the item");
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setFormData({
      item: item.item,
      id: item.id,
      quantity: item.quantity.toString(),
      unit_type: item.unit_type,
      max_capacity: item.max_capacity?.toString() ?? "",
      reserved_quantity: item.reserved_quantity?.toString() ?? "",
    });
    setIsUpdating(true);
    setShowForm(true);
  };

  const getStockStatus = (percentage: number | null) => {
    if (percentage === null) return { status: "healthy", color: "var(--primary-3)" };
    if (percentage >= 50) return { status: "healthy", color: "#10b981" };
    if (percentage >= 25) return { status: "warning", color: "#f59e0b" };
    return { status: "critical", color: "#ef4444" };
  };

  const totalItems = items.length;
  const lowStockItems = items.filter(item => item.percentage_left !== null && item.percentage_left < 25).length;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <main className="relative p-6">
        <div className="fixed inset-0 z-0">
          <CoffeeBackground />
        </div>
        <div className="relative z-10">
          <CoffeeLoading visible={loading} />
        </div>
      </main>
    );
  }

  return (
    <main className="relative p-6">
      {/* Coffee Background - positioned behind everything */}
      <div className="fixed inset-0 z-0">
        <CoffeeBackground />
      </div>

      {/* Content container with proper z-index */}
      <div className="relative z-10">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ color: "var(--primary-3)" }}>
                Inventory Management
              </h1>
              <p className="text-sm opacity-70" style={{ color: "var(--primary-3)" }}>
                Track and manage your coffee shop stock levels
              </p>
            </div>
            <button
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
              style={{
                backgroundColor: "var(--primary-3)",
                color: "var(--primary-1)",
              }}
              onClick={() => {
                setShowForm((prev) => !prev);
                if (showForm) {
                  setFormData({
                    item: "",
                    id: "",
                    quantity: "",
                    unit_type: "",
                    max_capacity: "",
                    reserved_quantity: "",
                  });
                  setIsUpdating(false);
                }
              }}
            >
              {showForm ? (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                  Cancel
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Add Item
                </>
              )}
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div
              className="p-5 rounded-xl shadow-lg backdrop-blur-sm"
              style={{
                backgroundColor: "var(--primary-2)",
                border: "1px solid var(--primary-3)",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-70 mb-1" style={{ color: "var(--primary-3)" }}>
                    Total Items
                  </p>
                  <p className="text-3xl font-bold" style={{ color: "var(--primary-3)" }}>
                    {totalItems}
                  </p>
                </div>
                <div
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: "var(--primary-4)" }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary-3)" strokeWidth="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                  </svg>
                </div>
              </div>
            </div>

            <div
              className="p-5 rounded-xl shadow-lg backdrop-blur-sm"
              style={{
                backgroundColor: "var(--primary-2)",
                border: "1px solid var(--primary-3)",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-70 mb-1" style={{ color: "var(--primary-3)" }}>
                    Low Stock Alerts
                  </p>
                  <p className="text-3xl font-bold" style={{ color: lowStockItems > 0 ? "#ef4444" : "var(--primary-3)" }}>
                    {lowStockItems}
                  </p>
                </div>
                <div
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: "var(--primary-4)" }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={lowStockItems > 0 ? "#ef4444" : "var(--primary-3)"} strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                </div>
              </div>
            </div>

            <div
              className="p-5 rounded-xl shadow-lg backdrop-blur-sm"
              style={{
                backgroundColor: "var(--primary-2)",
                border: "1px solid var(--primary-3)",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-70 mb-1" style={{ color: "var(--primary-3)" }}>
                    Total Stock Units
                  </p>
                  <p className="text-3xl font-bold" style={{ color: "var(--primary-3)" }}>
                    {totalQuantity}
                  </p>
                </div>
                <div
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: "var(--primary-4)" }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary-3)" strokeWidth="2">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                    <polyline points="17 6 23 6 23 12"></polyline>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        {showForm && (
          <div
            className="mb-6 p-6 rounded-xl border shadow-lg backdrop-blur-sm"
            style={{
              backgroundColor: "var(--primary-2)",
              borderColor: "var(--primary-3)",
            }}
          >
            <h3 className="text-xl font-bold mb-4" style={{ color: "var(--primary-3)" }}>
              {isUpdating ? "Update Item" : "Add New Item"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { field: "item", label: "Item Name", type: "text" },
                { field: "quantity", label: "Quantity", type: "number" },
                { field: "unit_type", label: "Unit Type", type: "text" },
                { field: "max_capacity", label: "Max Capacity", type: "number" },
              ].map(({ field, label, type }) => (
                <div key={field}>
                  <label
                    htmlFor={field}
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--primary-3)" }}
                  >
                    {label}
                  </label>
                  <input
                    id={field}
                    name={field}
                    type={type}
                    value={(formData as any)[field]}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        [field]: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg px-4 py-3 border-2 transition-all focus:outline-none focus:ring-2"
                    style={{
                      borderColor: "var(--primary-3)",
                      backgroundColor: "var(--primary-4)",
                      color: "var(--primary-3)",
                    }}
                    placeholder={`Enter ${label.toLowerCase()}`}
                  />
                </div>
              ))}
            </div>

            <button
              className="mt-6 px-8 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
              style={{
                backgroundColor: "var(--primary-3)",
                color: "var(--primary-1)",
              }}
              onClick={handleSubmit}
            >
              {isUpdating ? "Update Item" : "Add to Inventory"}
            </button>
          </div>
        )}

        {/* Inventory Grid */}
        {items.length === 0 ? (
          <div
            className="text-center py-16 rounded-xl"
            style={{
              backgroundColor: "var(--primary-2)",
              border: "2px dashed var(--primary-3)",
            }}
          >
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--primary-3)" strokeWidth="2" className="mx-auto mb-4 opacity-30">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            <p className="text-xl font-semibold mb-2" style={{ color: "var(--primary-3)" }}>
              No inventory items yet
            </p>
            <p className="text-sm opacity-70 mb-4" style={{ color: "var(--primary-3)" }}>
              Start by adding your first inventory item
            </p>
            <button
              className="px-6 py-3 rounded-xl font-semibold"
              style={{
                backgroundColor: "var(--primary-3)",
                color: "var(--primary-1)",
              }}
              onClick={() => setShowForm(true)}
            >
              Add First Item
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => {
              const stockStatus = getStockStatus(item.percentage_left);
              
              return (
                <div
                  key={item.id}
                  className="p-6 rounded-xl shadow-lg backdrop-blur-sm hover:scale-105 transition-all duration-200"
                  style={{
                    backgroundColor: "var(--primary-2)",
                    border: "2px solid var(--primary-3)",
                  }}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1" style={{ color: "var(--primary-3)" }}>
                        {item.item}
                      </h3>
                      <p className="text-sm opacity-70" style={{ color: "var(--primary-3)" }}>
                        Unit: {item.unit_type}
                      </p>
                    </div>
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 rounded-lg hover:scale-110 transition-all"
                      style={{ backgroundColor: "var(--primary-4)" }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary-3)" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                  </div>

                  {/* Progress Bar */}
                  {item.percentage_left !== null && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium" style={{ color: "var(--primary-3)" }}>
                          Stock Level
                        </span>
                        <span className="text-sm font-bold" style={{ color: stockStatus.color }}>
                          {item.percentage_left}%
                        </span>
                      </div>
                      <div
                        className="h-3 rounded-full overflow-hidden"
                        style={{ backgroundColor: "var(--primary-4)" }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${item.percentage_left}%`,
                            backgroundColor: stockStatus.color,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: "var(--primary-4)" }}
                    >
                      <p className="text-xs opacity-70 mb-1" style={{ color: "var(--primary-3)" }}>
                        Current
                      </p>
                      <p className="text-lg font-bold" style={{ color: "var(--primary-3)" }}>
                        {item.quantity}
                      </p>
                    </div>
                    <div
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: "var(--primary-4)" }}
                    >
                      <p className="text-xs opacity-70 mb-1" style={{ color: "var(--primary-3)" }}>
                        Max
                      </p>
                      <p className="text-lg font-bold" style={{ color: "var(--primary-3)" }}>
                        {item.max_capacity || "∞"}
                      </p>
                    </div>
                    <div
                      className="p-3 rounded-lg col-span-2"
                      style={{ backgroundColor: "var(--primary-4)" }}
                    >
                      <p className="text-xs opacity-70 mb-1" style={{ color: "var(--primary-3)" }}>
                        Reserved Quantity
                      </p>
                      <p className="text-lg font-bold" style={{ color: "var(--primary-3)" }}>
                        {item.reserved_quantity} {item.unit_type}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mt-4 flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={stockStatus.color} strokeWidth="2">
                      {item.percentage_left === null || item.percentage_left >= 50 ? (
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                      ) : item.percentage_left >= 25 ? (
                        <>
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                          <line x1="12" y1="9" x2="12" y2="13"></line>
                          <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </>
                      ) : (
                        <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
                      )}
                    </svg>
                    <span
                      className="text-xs font-semibold uppercase tracking-wide"
                      style={{ color: stockStatus.color }}
                    >
                      {stockStatus.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}