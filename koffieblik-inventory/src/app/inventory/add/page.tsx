'use client'
import React, { useState } from 'react'
import Link from 'next/link'

interface FormData {
  name: string
  category: string
  quantity: number
  price: number
}

export default function AddItemPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    category: '',
    quantity: 0,
    price: 0
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'price' ? parseFloat(value) || 0 : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call - replace with your actual API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('Adding new inventory item:', formData)
    setShowSuccess(true)
    setIsSubmitting(false)
    
    // Reset form after success
    setTimeout(() => {
      setFormData({ name: '', category: '', quantity: 0, price: 0 })
      setShowSuccess(false)
    }, 2000)
  }

  return (
    <main className="min-h-screen bg-brown-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/inventory" 
            className="inline-flex items-center text-brown-600 hover:text-brown-800 mb-4 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Inventory
          </Link>
          <h1 className="text-4xl font-bold text-brown-800">Add New Item</h1>
        </div>

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
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Item Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-semibold text-brown-800 uppercase tracking-wide">
                Item Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-brown-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-100 focus:border-amber-500 text-brown-700 placeholder-brown-400"
                placeholder="Enter item name..."
                required
              />
            </div>

            
            <div className="space-y-2">
              <label htmlFor="category" className="block text-sm font-semibold text-brown-800 uppercase tracking-wide">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 text-brown-700 border-2 border-brown-200 rounded-xl focus:ring-4 focus:ring-amber-100 focus:border-amber-500"
                required
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

            {/* Quantity and Price Grid */}
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
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-3 text-brown-700 border-2 border-brown-200 rounded-xl focus:ring-4 focus:ring-amber-100 focus:border-amber-500 placeholder-brown-400"
                  placeholder="0"
                  required
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
          value={formData.price === 0 ? '' : formData.price}
          onChange={handleInputChange}
          min="0"
          step="0.01"
          className="w-full px-4 py-3 text-brown-700 border-2 border-brown-200 rounded-xl focus:ring-4 focus:ring-amber-100 focus:border-amber-500 placeholder-brown-400"
          placeholder="0.00"
          required
          />
      </div>


            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold rounded-xl transition-colors duration-200 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding Item...
                  </>
                ) : (
                  'Add Item'
                )}
              </button>
              
              <Link
                href="/inventory"
                className="flex-1 px-6 py-3 bg-brown-200 hover:bg-brown-300 text-brown-800 font-semibold rounded-xl transition-colors duration-200 text-center flex items-center justify-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* Form Preview */}
        {(formData.name || formData.category || formData.quantity > 0 || formData.price > 0) && (
          <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-brown-800 mb-4">Preview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="block text-brown-600 font-medium">Item Name:</span>
                <span className="text-brown-800">{formData.name || '-'}</span>
              </div>
              <div>
                <span className="block text-brown-600 font-medium">Category:</span>
                <span className="text-brown-800">{formData.category || '-'}</span>
              </div>
              <div>
                <span className="block text-brown-600 font-medium">Quantity:</span>
                <span className="text-brown-800">{formData.quantity}</span>
              </div>
              <div>
                <span className="block text-brown-600 font-medium">Price:</span>
                <span className="text-brown-800">R {formData.price.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}