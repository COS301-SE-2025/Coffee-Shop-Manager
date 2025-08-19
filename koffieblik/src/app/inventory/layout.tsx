import React from "react";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";

export const metadata = {
  title: "Inventory - DieKoffieBlik",
  description: "Manage the inventory system of a coffee shop",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="h-screen flex flex-col"
      style={{ backgroundColor: "var(--primary-1)" }}
    >
      {/* ✅ Top Navbar */}
      <Navbar />

      {/* ✅ Main content: full height after navbar */}
      <div
        className="flex flex-1 overflow-hidden"
        style={{ color: "var(--primary-3)" }}
      >
        {/* ✅ Sidebar (fixed height, scrolls with page) */}
        <nav
          className="w-64 p-5 shadow-inner-lg overflow-y-auto"
          style={{
            backgroundColor: "var(--primary-4)",
            borderRight: "1px solid var(--primary-3)",
          }}
        >
          <h2
            className="text-xl font-bold mb-4"
            style={{ color: "var(--primary-3)" }}
          >
            ☕ Inventory Menu
          </h2>

          <ul className="space-y-2">
            <li>
              <Link
                href="/inventory"
                className="block px-4 py-2 rounded-lg"
                style={{ color: "var(--primary-3)" }}
              >
                Overview
              </Link>
            </li>

            <li>{/* Add more links if needed */}</li>
          </ul>
        </nav>

        {/* ✅ Scrollable content area */}
        <div
          className="flex-1 overflow-y-auto p-6"
          style={{ backgroundColor: "var(--primary-2)" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
