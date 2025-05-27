// src/app/inventory/add/page.tsx
import React from 'react'
import Link from 'next/link'


interface FormData {
  name: string
  category: string
  quantity: number
  price: number
}

export default function AddItemPage() {

  







  return (
    <main className="min-h-screen bg-brown-50 p-6">
      <div className="max-w-2xl mx-auto">

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



      </div>

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


            <div className="space-y-2">
              <label htmlFor="category" className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                Category
              </label>
              <select
                id="category"
                name="category"

                className="w-full px-4 py-3 text-gray-500 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 "
                required
              >
                <option value="">Select a category</option>
                <option value="Coffee"> Coffee</option>
                <option value="Tea"> Tea</option>
                <option value="Dairy">Dairy</option>
                <option value="Mixes"> Mixes</option>
                <option value="condiments"> condiments</option>
                <option value="Other">Other</option>
              </select>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="quantity" className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  Quantity
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  
                  min="0"
                  className="w-full px-4 py-3 text-gray-500 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                  placeholder="0"
                  required
                />
              </div>

              </div>


      </form>

      
    </main>
  )
}
