"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
  }, []);

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
      const response = await fetch(`${API_BASE_URL}/stock`, {
        method: "PUT",
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
          // alert(`Updated: ${result.updatedItems?.join(", ")}`);
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
          alert(`Added: ${result.createdItems?.join(", ")}`);
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

  return (
    <main
      className="min-h-screen p-6"
      style={{ backgroundColor: "var(--primary-2)" }}
    >
      <div className="flex justify-between items-center mb-6">
        <h1
          className="text-4xl font-bold"
          style={{ color: "var(--primary-3)" }}
        >
          Inventory Stock
        </h1>
        <button
          className="btn"
          onClick={() => {
            setShowForm((prev) => !prev);
            setFormData({
              item: "",
              id: "",
              quantity: "",
              unit_type: "",
              max_capacity: "",
              reserved_quantity: "",
            });
            setIsUpdating(false);
          }}
        >
          {showForm ? "Cancel" : "Add Inventory"}
        </button>
      </div>

      {showForm && (
        <div
          className="mb-6 p-4 rounded-xl border"
          style={{
            backgroundColor: "var(--primary-4)",
            borderColor: "var(--primary-3)",
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "item",
              "quantity",
              "unit_type",
              "max_capacity",

            ].map((field) => (
              <div key={field}>
                <label
                  htmlFor={field}
                  className="block text-sm font-medium capitalize"
                  style={{ color: "var(--primary-3)" }}
                >
                  {field.replace("_", " ")}
                </label>
                <input
                  id={field}
                  name={field}
                  type={
                    field.includes("quantity") || field === "max_capacity"
                      ? "number"
                      : "text"
                  }
                  value={(formData as any)[field]}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [field]: e.target.value,
                    }))
                  }
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  style={{
                    borderColor: "var(--primary-3)",
                    color: "var(--primary-3)",
                    caretColor: "var(--primary-3)",
                  }}
                />
              </div>
            ))}
          </div>

          <button className="btn mt-4" onClick={handleSubmit}>
            {isUpdating ? "Update" : "Submit"}
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-lg" style={{ color: "var(--primary-3)" }}>
          Loading stock...
        </p>
      ) : (
        <div
          className="overflow-x-auto rounded-xl shadow-lg"
          style={{ backgroundColor: "var(--primary-2)" }}
        >
          <table
            className="min-w-full divide-y"
            style={{ borderColor: "var(--primary-3)" }}
          >
            <thead style={{ backgroundColor: "var(--primary-4)" }}>
              <tr>
                <th
                  className="px-4 py-3 text-left text-sm font-medium"
                  style={{ color: "var(--primary-3)" }}
                >
                  Item
                </th>
                <th
                  className="px-4 py-3 text-right text-sm font-medium"
                  style={{ color: "var(--primary-3)" }}
                >
                  Quantity
                </th>
                <th
                  className="px-4 py-3 text-right text-sm font-medium"
                  style={{ color: "var(--primary-3)" }}
                >
                  Unit
                </th>
                <th
                  className="px-4 py-3 text-right text-sm font-medium"
                  style={{ color: "var(--primary-3)" }}
                >
                  % Left
                </th>
                <th
                  className="px-4 py-3 text-right text-sm font-medium"
                  style={{ color: "var(--primary-3)" }}
                >
                  Max Capacity
                </th>
                <th
                  className="px-4 py-3 text-right text-sm font-medium"
                  style={{ color: "var(--primary-3)" }}
                >
                  Reserved
                </th>
                <th
                  className="px-4 py-3 text-right text-sm font-medium"
                  style={{ color: "var(--primary-3)" }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody
              className="divide-y"
              style={{ borderColor: "var(--primary-3)" }}
            >
              {items.map((item) => (
                <tr key={item.id}>
                  <td
                    className="px-4 py-2"
                    style={{ color: "var(--primary-3)" }}
                  >
                    {item.item}
                  </td>
                  <td
                    className="px-4 py-2 text-right"
                    style={{ color: "var(--primary-3)" }}
                  >
                    {item.quantity}
                  </td>
                  <td
                    className="px-4 py-2 text-right"
                    style={{ color: "var(--primary-3)" }}
                  >
                    {item.unit_type}
                  </td>
                  <td
                    className="px-4 py-2 text-right"
                    style={{ color: "var(--primary-3)" }}
                  >
                    {item.percentage_left !== null
                      ? `${item.percentage_left}%`
                      : "N/A"}
                  </td>
                  <td
                    className="px-4 py-2 text-right"
                    style={{ color: "var(--primary-3)" }}
                  >
                    {item.max_capacity !== null ? item.max_capacity : "∞"}
                  </td>
                  <td
                    className="px-4 py-2 text-right"
                    style={{ color: "var(--primary-3)" }}
                  >
                    {item.reserved_quantity}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button className="btn" onClick={() => handleEdit(item)}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
