// src/app/inventory/add/page.tsx
import React from 'react'
import Link from 'next/link'

export default function AddItemPage() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add New Inventory Item</h1>

      {/* <form className="space-y-4">
        <div>
          <label htmlFor="name" className="block font-medium">Name</label>
          <input id="name" name="name" type="text"
                 className="w-full border rounded px-2 py-1" />
        </div>

        <div>
          <label htmlFor="quantity" className="block font-medium">Quantity</label>
          <input id="quantity" name="quantity" type="number"
                 className="w-full border rounded px-2 py-1" />
        </div>

        <button type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded">
          Create Item
        </button>
      </form> */}

      <p className="mt-4">
        <Link href="/inventory" className="text-blue-500 hover:underline">
          ← back to inventory list
        </Link>
      </p>
    </main>
  )
}
