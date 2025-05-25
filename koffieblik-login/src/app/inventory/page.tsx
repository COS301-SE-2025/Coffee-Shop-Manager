// src/app/inventory/page.tsx
import React from 'react'

interface InventoryItem {
  id: number
  name: string
  category: string
  quantity: number
  price: number
}

//use mock data for now
const inventoryData: InventoryItem[] = [

  { id: 1, name: 'Coffee beans', category: 'Coffee', quantity: 12, price: 15.00 },

  { id: 2, name: 'Decaf Espresso Beans',category: 'Coffee', quantity: 10, price: 15.00},

  { id: 3, name: 'full cream Milk', category: 'Dairy', quantity: 8, price: 5.00 },

  { id: 4, name: 'Almond Milk', category: 'Dairy Alternative', quantity: 5, price: 7.50},

  { id: 5, name: 'Syrup', category: 'Syrups', quantity: 3, price: 10.00 },

  { id: 6, name: 'Chocolate Powder', category: 'Mixes', quantity: 6, price: 15.00 },

  { id: 7,  name: 'Black Tea Bags',  category: 'Tea',quantity: 20, price: 5.00 },

  { id: 8,  name: 'Green Tea Bags', category: 'Tea',quantity: 15, price: 6.00 },

  { id: 9, name: 'Sugar Packets',  category: 'Condiments', quantity:200, price: 2.50 },

  { id: 10, name: 'Brown Sugar Packets', category: 'Condiments', quantity:100, price: 2.50 },




]

export default function InventoryPage() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Inventory</h1>
      {}
      <p>Place inventory items here.</p>
    </main>
  )
}
