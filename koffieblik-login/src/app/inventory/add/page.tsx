// src/app/inventory/add/page.tsx
import React from 'react'
import Link from 'next/link'

export default function AddItemPage() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add New Inventory Item</h1>

      <form  className="p-8 space-y-6">

        <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700 ">
                Item Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500  "
                placeholder="Enter item name.."
                required
              />
            </div>


      </form>

      <p className="mt-4">
        <Link href="/inventory" className="text-blue-500 hover:underline">
          ← back to inventory list
        </Link>
      </p>
    </main>
  )
}
