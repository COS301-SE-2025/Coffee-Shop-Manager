// src/app/inventory/page.tsx
import React from 'react'

interface InventoryItem {
  id: number
  name: string
  category: string
  quantity: number
  unitPrice: number
}

export default function InventoryPage() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Inventory</h1>
      {}
      <p>Place inventory items here.</p>
    </main>
  )
}
