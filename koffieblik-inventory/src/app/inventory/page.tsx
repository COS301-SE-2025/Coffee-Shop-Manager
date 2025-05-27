'use client'

import React, { useState, ChangeEvent } from 'react'

interface InventoryItem {
  id: number
  name: string
  category: string
  quantity: number
  price: number
}

const initialData: InventoryItem[] = [
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
  // turn into state for delete
  const [items, setItems] = useState<InventoryItem[]>(initialData)

  //To edit the inventory items
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<InventoryItem>({
    id: 0,
    name: '',
    category: '',
    quantity: 0,
    price: 0,
  })

  //
  const handleDelete = (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      setItems(prev => prev.filter(item => item.id !== id))
    }
  }

  const startEdit = (item: InventoryItem) => {
    setEditingId(item.id)
    setEditForm({ ...item })


  }

  const cancelEdit = () => {
    setEditingId(null)

  }

  const saveEdit = () => {
    setItems(prev =>
      prev.map(item =>
        item.id === editingId ? { ...editForm } : item
      )
    )
    setEditingId(null)
  }

  const handleChange = (
    e: ChangeEvent<HTMLInputElement>,
    field: keyof Omit<InventoryItem, 'id'>
  ) => {
    const value =
      field === 'quantity'
        ? parseInt(e.target.value, 10) || 0
        : field === 'price'
        ? parseFloat(e.target.value) || 0
        : e.target.value

    setEditForm(prev => ({
      ...prev,
      [field]: value,
    }))
  }

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
            {items.map(item => {
              const isEditing = item.id === editingId

              return (
                <tr key={item.id} className="hover:bg-amber-50">
                  {/* Name */}
                  <td className="px-4 py-2 text-brown-700">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={e => handleChange(e, 'name')}
                        className="w-full border rounded p-1"
                      />
                    ) : (
                      item.name
                    )}
                  </td>

                  {/* Category */}
                  <td className="px-4 py-2 text-brown-700">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.category}
                        onChange={e => handleChange(e, 'category')}
                        className="w-full border rounded p-1"
                      />
                    ) : (
                      item.category
                    )}
                  </td>

                  {/* Quantity */}
                  <td className="px-4 py-2 text-right text-brown-700">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.quantity}
                        onChange={e => handleChange(e, 'quantity')}
                        className="w-20 border rounded p-1 text-right"
                      />
                    ) : (
                      item.quantity
                    )}
                  </td>

                  {/* Price */}
                  <td className="px-4 py-2 text-right text-brown-700">
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.price}
                        onChange={e => handleChange(e, 'price')}
                        className="w-24 border rounded p-1 text-right"
                      />
                    ) : (
                      `R ${item.price.toFixed(2)}`
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-2 text-center space-x-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={saveEdit}
                          className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(item)}
                          className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.name)}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </main>
  )
}