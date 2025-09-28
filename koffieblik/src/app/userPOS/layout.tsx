import React from "react";
import Navbar from "@/app/components/Navbar";

export const metadata = {
  title: "Orders - DieKoffieBlik",
  description: "Dashboard overview for managing DieKoffieBlik coffee shop",
  icons: {
    icon: "/icon.svg",
  },
};

interface OrderLayoutProps {
  children: React.ReactNode;
}

export default function OrderLayout({ children }: OrderLayoutProps) {
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      {/* Navigation home / order online */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
