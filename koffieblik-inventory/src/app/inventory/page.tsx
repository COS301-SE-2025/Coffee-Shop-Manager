'use client'

import React from 'react'

interface InventoryItem {
  id: number
  name: string
  category: string
  quantity: number
  price: number
}

const inventoryData: InventoryItem[] = [
  { id: 1, name: 'Coffee beans', category: 'Coffee', quantity: 12, price: 15.0 },
  { id: 2, name: 'Decaf Espresso Beans', category: 'Coffee', quantity: 10, price: 15.0 },
  { id: 3, name: 'Full Cream Milk', category: 'Dairy', quantity: 8, price: 5.0 },
  { id: 4, name: 'Almond Milk', category: 'Dairy Alternative', quantity: 5, price: 7.5 },
  { id: 5, name: 'Syrup', category: 'Syrups', quantity: 3, price: 10.0 },
  { id: 6, name: 'Chocolate Powder', category: 'Mixes', quantity: 6, price: 15.0 },
  { id: 7, name: 'Black Tea Bags', category: 'Tea', quantity: 20, price: 5.0 },
  { id: 8, name: 'Green Tea Bags', category: 'Tea', quantity: 15, price: 6.0 },
  { id: 9, name: 'Sugar Packets', category: 'Condiments', quantity: 200, price: 2.5 },
  { id: 10, name: 'Brown Sugar Packets', category: 'Condiments', quantity: 100, price: 2.5 },
]

export default function InventoryPage() {
  return (
    <main className="min-h-screen bg-brown-50 p-6">
      <h1 className="text-4xl font-bold text-brown-800 mb-6">Inventory</h1>

      <div className="overflow-x-auto bg-white rounded-xl shadow-inner-lg">
        <table className="min-w-full divide-y divide-brown-100">
          <thead className="bg-amber-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-brown-800">Item</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-brown-800">Category</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-brown-800">Quantity</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-brown-800">Price</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-brown-800">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-brown-100">
            {inventoryData.map(item => (
              <tr key={item.id} className="hover:bg-amber-50">
                <td className="px-4 py-2 text-brown-700">{item.name}</td>
                <td className="px-4 py-2 text-brown-700">{item.category}</td>
                <td className="px-4 py-2 text-right text-brown-700">{item.quantity}</td>
                <td className="px-4 py-2 text-right text-brown-700">R {item.price.toFixed(2)}</td>
                <td className="px-4 py-2 text-center">
                  <button className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded mr-2">
                    Edit
                  </button>
                  <button
                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
                    onClick={() => handleDelete(item.id, item.name)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}

const handleDelete = (id: number, name: string) => {
  if (confirm(`Are you sure you want to delete ${name}?`)) {
    // delete logic
  }
}
