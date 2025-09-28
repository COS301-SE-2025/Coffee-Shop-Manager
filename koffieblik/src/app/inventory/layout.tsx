import React from "react";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";

export const metadata = {
  title: "Inventory - DieKoffieBlik",
  description: "Manage the inventory system of a coffee shop",
  icons: {
    icon: "/icon.svg",
  },
};

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative">
      {/* Background div that covers everything */}
      <div className="fixed inset-0 w-full h-full z-0">
        <div className="absolute inset-0 bg-[var(--primary-1)]" />
      </div>

      {/* Content wrapper */}
      <div className="relative z-20 min-h-screen flex flex-col">
        {/* Navbar */}
        <Navbar />

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden p-6">
          {/* Sidebar with new styling */}
          <nav
            className="w-64 overflow-hidden rounded-xl shadow-lg backdrop-blur-sm bg-opacity-80 relative z-30 ml-2"
            style={{
              backgroundColor: "var(--primary-2)",
              border: "1px solid var(--primary-3)",
            }}
          >
            <div
              className="p-5"
              style={{
                backgroundColor: "var(--primary-4)",
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
                    className="block px-4 py-2 rounded-lg hover:bg-opacity-80"
                    style={{ color: "var(--primary-3)" }}
                  >
                    Overview
                  </Link>
                </li>

                <li>{/* Add more links if needed */}</li>
              </ul>
            </div>
          </nav>

          {/* Content area with adjusted margin */}
          <div className="flex-1 overflow-y-auto relative z-10 ml-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
