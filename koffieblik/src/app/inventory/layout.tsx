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
          

          {/* Content area with adjusted margin */}
          <div className="flex-1 overflow-y-auto relative z-10 ml-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
