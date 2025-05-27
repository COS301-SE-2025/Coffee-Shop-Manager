// src/app/inventory/layout.tsx
import React from 'react'
import Link from 'next/link'

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-brown-50 text-amber-800">
      <nav className="w-64 bg-amber-100 p-5 shadow-inner-lg border-r border-brown-200">
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
            {/* <Link 
              href="/inventory/add" 
              className="block px-4 py-2 rounded-lg hover:bg-amber-200 hover:text-brown-900 transition"
            >
              Add Item
            </Link> */}
          </li>
        </ul>
      </nav>

      <div className="flex-1 p-6 bg-white">
        {children}
      </div>
    </div>
  )
}
