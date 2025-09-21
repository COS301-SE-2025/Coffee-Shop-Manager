import React from "react";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";

export const metadata = {
  title: "Profile - DieKoffieBlik",
  description: "Manage your profile and view badges",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function UserLayout({
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