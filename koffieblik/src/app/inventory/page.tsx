'use client'

import React, { useState, ChangeEvent } from 'react'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getTabs } from '@/constants/tabs';




interface InventoryItem {
  id: number
  name: string
  category: string
  quantity: number
  price: number
}

interface FormData {
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
  const router = useRouter();
  const [username, setUsername] = useState('Guest');
  const [selectedTab, setSelectedTab] = useState('Inventory');

  // useEffect(() => {
  //   const storedUsername = localStorage.getItem('username');
  //   const isLoggedIn = localStorage.getItem('isLoggedIn');

  //   if (!isLoggedIn) {
  //     router.push('/login');
  //   }

  //   if (storedUsername) {
  //     setUsername(storedUsername);
  //   }
  // }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    router.push('/login');
  };

  const tabs = getTabs(username);
  const [items, setItems] = useState<InventoryItem[]>(initialData)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<InventoryItem>({ id: 0, name: '', category: '', quantity: 0, price: 0 })
  const [isAdding, setIsAdding] = useState(false)
  const [addForm, setAddForm] = useState<FormData>({ name: '', category: '', quantity: 0, price: 0 })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)



  // Delete
  const handleDelete = (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      setItems(prev => prev.filter(item => item.id !== id))
    }
  }

  // Edit
  const startEdit = (item: InventoryItem) => {
    setEditingId(item.id)
    setEditForm({ ...item })
  }

  const cancelEdit = () => setEditingId(null)

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

  // Add
  const handleAddChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    const parsed = name === 'quantity' || name === 'price'
      ? parseFloat(value) || 0
      : value
    setAddForm(prev => ({ ...prev, [name]: parsed }))
  }

  const handleAddSubmit = async () => {
    if (!addForm.name || !addForm.category || addForm.quantity <= 0 || addForm.price <= 0) {
      alert('Please fill in all fields with valid values')
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    const newId = items.length ? Math.max(...items.map(i => i.id)) + 1 : 1
    setItems(prev => [...prev, { id: newId, ...addForm }])

    setShowSuccess(true)
    setIsSubmitting(false)

    // Reset form after success
    setTimeout(() => {
      setAddForm({ name: '', category: '', quantity: 0, price: 0 })
      setShowSuccess(false)
      setIsAdding(false)
    }, 2000)
  }

  return (
    <main className="min-h-screen bg-brown-50 p-6">
      {/* <nav className="sticky top-0 z-50 bg-white border-b border-amber-200 px-8 py-4 flex gap-4 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`text-sm font-semibold px-4 py-2 rounded-full transition ${selectedTab === tab
                ? 'bg-amber-600 text-white'
                : 'bg-amber-200 text-amber-900 hover:bg-amber-300'
              }`}
            onClick={() => {
              setSelectedTab(tab);
              if (tab === 'Logout') {
                handleLogout();
              } else if (tab === username) {
                alert('Go to profile from Dashboard.');
              } else {
                router.push(`/${tab.toLowerCase()}`);
              }
            }}
          >
            {tab}
          </button>
        ))}
      </nav> */}

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
        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
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

          {/* Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="space-y-6">
              {/* Item Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-semibold text-brown-800 uppercase tracking-wide">
                  Item Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={addForm.name}
                  onChange={handleAddChange}
                  className="w-full px-4 py-3 border-2 border-brown-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-100 focus:border-amber-500 text-brown-700 placeholder-brown-400"
                  placeholder="Enter item name..."
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label htmlFor="category" className="block text-sm font-semibold text-brown-800 uppercase tracking-wide">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={addForm.category}
                  onChange={handleAddChange}
                  className="w-full px-4 py-3 text-brown-700 border-2 border-brown-200 rounded-xl focus:ring-4 focus:ring-amber-100 focus:border-amber-500"
                >
                  <option value="">Select a category</option>
                  <option value="Coffee">Coffee</option>
                  <option value="Tea">Tea</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Dairy Alternative">Dairy Alternative</option>
                  <option value="Syrups">Syrups</option>
                  <option value="Mixes">Mixes</option>
                  <option value="Condiments">Condiments</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Quantity and Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Quantity */}
                <div className="space-y-2">
                  <label htmlFor="quantity" className="block text-sm font-semibold text-brown-800 uppercase tracking-wide">
                    Quantity
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={addForm.quantity === 0 ? '' : addForm.quantity}
                    onChange={handleAddChange}
                    min="0"
                    className="w-full px-4 py-3 text-brown-700 border-2 border-brown-200 rounded-xl focus:ring-4 focus:ring-amber-100 focus:border-amber-500 placeholder-brown-400"
                    placeholder="0"
                  />
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <label htmlFor="price" className="block text-sm font-semibold text-brown-800 uppercase tracking-wide">
                    Price (R)
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={addForm.price === 0 ? '' : addForm.price}
                    onChange={handleAddChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 text-brown-700 border-2 border-brown-200 rounded-xl focus:ring-4 focus:ring-amber-100 focus:border-amber-500 placeholder-brown-400"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  onClick={handleAddSubmit}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold rounded-xl transition-colors duration-200 flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      </svg>
                      Adding Item...
                    </>
                  ) : (
                    'Add Item'
                  )}
                </button>

                <button
                  onClick={() => {
                    setIsAdding(false)
                    setAddForm({ name: '', category: '', quantity: 0, price: 0 })
                    setShowSuccess(false)
                  }}
                  className="flex-1 px-6 py-3 bg-brown-200 hover:bg-brown-300 text-brown-800 font-semibold rounded-xl transition-colors duration-200 text-center flex items-center justify-center"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>

          {/* Form Preview */}
          {(addForm.name || addForm.category || addForm.quantity > 0 || addForm.price > 0) && (
            <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-brown-800 mb-4">Preview</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="block text-brown-600 font-medium">Item Name:</span>
                  <span className="text-brown-800">{addForm.name || '-'}</span>
                </div>
                <div>
                  <span className="block text-brown-600 font-medium">Category:</span>
                  <span className="text-brown-800">{addForm.category || '-'}</span>
                </div>
                <div>
                  <span className="block text-brown-600 font-medium">Quantity:</span>
                  <span className="text-brown-800">{addForm.quantity}</span>
                </div>
                <div>
                  <span className="block text-brown-600 font-medium">Price:</span>
                  <span className="text-brown-800">R {addForm.price.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
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
                    <td className="px-4 py-2 text-brown-700">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={e => handleEditChange(e, 'name')}
                          className="w-full border rounded p-1"
                        />
                      ) : item.name}
                    </td>
                    <td className="px-4 py-2 text-brown-700">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.category}
                          onChange={e => handleEditChange(e, 'category')}
                          className="w-full border rounded p-1"
                        />
                      ) : item.category}
                    </td>
                    <td className="px-4 py-2 text-right text-brown-700">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.quantity}
                          onChange={e => handleEditChange(e, 'quantity')}
                          className="w-20 border rounded p-1 text-right"
                        />
                      ) : item.quantity}
                    </td>
                    <td className="px-4 py-2 text-right text-brown-700">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={editForm.price}
                          onChange={e => handleEditChange(e, 'price')}
                          className="w-24 border rounded p-1 text-right"
                        />
                      ) : `R ${item.price.toFixed(2)}`}
                    </td>
                    <td className="px-4 py-2 text-center space-x-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={saveEdit}
                            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
                          >Save</button>
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded transition-colors"
                          >Cancel</button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(item)}
                            className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded transition-colors"
                          >Edit</button>
                          <button
                            onClick={() => handleDelete(item.id, item.name)}
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                          >Delete</button>
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