import React from 'react';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';

export const metadata = {
  title: 'Inventory - DieKoffieBlik',
  description: 'Manage the inventory system of a coffee shop',
  icons: {
    icon: '/favicon.ico'
  }
};

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col bg-amber-50">
      {/* ✅ Top Navbar */}
      <Navbar />

      {/* ✅ Main content: full height after navbar */}
      <div className="flex flex-1 overflow-hidden text-amber-800">
        {/* ✅ Sidebar (fixed height, scrolls with page) */}
        <nav className="w-64 bg-amber-100 p-5 shadow-inner-lg border-r border-brown-200 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4 text-amber-800">☕ Inventory Menu</h2>
          <ul className="space-y-2">
            <li>
              <Link 
                href="/inventory" 
                className="block px-4 py-2 rounded-lg hover:bg-amber-200 hover:text-brown-900 transition"
              >
                Overview
              </Link>
            </li>
            <li>
              {/* Add more links if needed */}
            </li>
          </ul>
        </nav>

        {/* ✅ Scrollable content area */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {children}
        </div>
      </div>
    </div>
  );
}
