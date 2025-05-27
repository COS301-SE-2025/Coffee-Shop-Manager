'use client'

import React, { useState, useEffect, ChangeEvent } from 'react'

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  price: number;
}

interface FormData {
  name: string;
  category: string;
  quantity: number;
  price: number;
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
  // Load items from localStorage or fall back to initialData
  const [items, setItems] = useState<InventoryItem[]>(() => {
    if (typeof window === 'undefined') return initialData
    const saved = window.localStorage.getItem('inventory-items')
    return saved ? JSON.parse(saved) as InventoryItem[] : initialData
  })

  // Persist to localStorage on every change
  useEffect(() => {
    window.localStorage.setItem('inventory-items', JSON.stringify(items))
  }, [items])

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<InventoryItem>({ id: 0, name: '', category: '', quantity: 0, price: 0 })
  const [isAdding, setIsAdding] = useState(false)
  const [addForm, setAddForm] = useState<FormData>({ name: '', category: '', quantity: 0, price: 0 })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // DELETE
  const handleDelete = (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      setItems(prev => prev.filter(item => item.id !== id))
    }
  }

  // EDIT
  const startEdit = (item: InventoryItem) => {
    setEditingId(item.id)
    setEditForm({ ...item })
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const saveEdit = () => {
    setItems(prev => prev.map(item => item.id === editingId ? { ...editForm } : item))
    setEditingId(null)
  }

  const handleEditChange = (
    e: ChangeEvent<HTMLInputElement>,
    field: keyof Omit<InventoryItem, 'id'>
  ) => {
    const value =
      field === 'quantity'
        ? parseInt(e.target.value, 10) || 0
        : field === 'price'
        ? parseFloat(e.target.value) || 0
        : e.target.value
    setEditForm(prev => ({ ...prev, [field]: value }))
  }

  // ADD
  const handleAddChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    const parsed = name === 'quantity' || name === 'price'
      ? parseFloat(value) || 0
      : value
    setAddForm(prev => ({ ...prev, [name]: parsed as any }))
  }

  const handleAddSubmit = async () => {
    if (!addForm.name || !addForm.category || addForm.quantity <= 0 || addForm.price <= 0) {
      alert('Please fill in all fields with valid values')
      return
    }

    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    const newId = items.length ? Math.max(...items.map(i => i.id)) + 1 : 1
    setItems(prev => [...prev, { id: newId, ...addForm }])
    setShowSuccess(true)
    setIsSubmitting(false)

    setTimeout(() => {
      setAddForm({ name: '', category: '', quantity: 0, price: 0 })
      setShowSuccess(false)
      setIsAdding(false)
    }, 1500)
  }

  return (
    <main className="min-h-screen bg-brown-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-brown-800">
          {isAdding ? 'Add New Item' : 'Inventory'}
        </h1>
        <button
          onClick={() => {
            setIsAdding(prev => !prev)
            if (isAdding) {
              setAddForm({ name: '', category: '', quantity: 0, price: 0 })
              setShowSuccess(false)
            }
          }}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded transition-colors"
        >
          {isAdding ? 'Back to Inventory' : 'Add Item'}
        </button>
      </div>

      {isAdding ? (
        <div className="max-w-xl mx-auto">
          {showSuccess && (
            <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-xl">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-700 font-medium">Item added successfully!</span>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
            <div>
              <label htmlFor="name" className="block mb-1 font-semibold text-brown-800">Item Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={addForm.name}
                onChange={handleAddChange}
                className="w-full p-3 border rounded"
                placeholder="Enter item name"
              />
            </div>

            <div>
              <label htmlFor="category" className="block mb-1 font-semibold text-brown-800">Category</label>
              <select
                id="category"
                name="category"
                value={addForm.category}
                onChange={handleAddChange}
                className="w-full p-3 border rounded"
              >
                <option value="">Select category</option>
                <option>Coffee</option>
                <option>Tea</option>
                <option>Dairy</option>
                <option>Dairy Alternative</option>
                <option>Syrups</option>
                <option>Mixes</option>
                <option>Condiments</option>
                <option>Other</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="quantity" className="block mb-1 font-semibold text-brown-800">Quantity</label>
                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min={0}
                  value={addForm.quantity || ''}
                  onChange={handleAddChange}
                  className="w-full p-3 border rounded"
                  placeholder="0"
                />
              </div>

              <div>
                <label htmlFor="price" className="block mb-1 font-semibold text-brown-800">Price (R)</label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  min={0}
                  step="0.01"
                  value={addForm.price || ''}
                  onChange={handleAddChange}
                  className="w-full p-3 border rounded"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleAddSubmit}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded"
              >
                {isSubmitting ? 'Adding...' : 'Add Item'}
              </button>

              <button
                onClick={() => setIsAdding(false)}
                className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-amber-100">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-brown-800">Item</th>
                <th className="px-4 py-2 text-left font-medium text-brown-800">Category</th>
                <th className="px-4 py-2 text-right font-medium text-brown-800">Quantity</th>
                <th className="px-4 py-2 text-right font-medium text-brown-800">Price</th>
                <th className="px-4 py-2 text-center font-medium text-brown-800">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map(item => {
                const isEditing = item.id === editingId
                return (
                  <tr key={item.id} className="hover:bg-amber-50">
                    <td className="px-4 py-2">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={e => handleEditChange(e, 'name')}
                          className="w-full border rounded p-1"
                        />
                      ) : (
                        item.name
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.category}
                          onChange={e => handleEditChange(e, 'category')}
                          className="w-full border rounded p-1"
                        />
                      ) : (
                        item.category
                      )}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.quantity}
                          onChange={e => handleEditChange(e, 'quantity')}
                          className="w-16 border rounded p-1 text-right"
                        />
                      ) : (
                        item.quantity
                      )}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={editForm.price}
                          onChange={e => handleEditChange(e, 'price')}
                          className="w-20 border rounded p-1 text-right"
                        />
                      ) : (
                        `R ${item.price.toFixed(2)}`
                      )}
                    </td>
                    <td className="px-4 py-2 text-center space-x-2">
                      {isEditing ? (
                        <>
                          <button onClick={saveEdit} className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded">
                            Save
                          </button>
                          <button onClick={cancelEdit} className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded">
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(item)} className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(item.id, item.name)} className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded">
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
      )}
    </main>
  )
}
