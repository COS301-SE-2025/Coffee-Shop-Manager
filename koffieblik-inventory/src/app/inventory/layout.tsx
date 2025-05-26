// src/app/inventory/layout.tsx
import React from 'react'
import Link from 'next/link'

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <nav className="w-60 bg-gray-100 p-4">
        <h2 className="font-semibold mb-2">Inventory Menu</h2>
        <ul>
          <li>
            <Link href="/inventory" className="block px-3 py-2 rounded hover:bg-gray-100">Overview</Link>
          </li>
          <li>
            <Link href="/inventory/add"  className="block px-3 py-2 rounded hover:bg-gray-100">Add Item</Link>
          </li>
          {}
        </ul>
      </nav>
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}
