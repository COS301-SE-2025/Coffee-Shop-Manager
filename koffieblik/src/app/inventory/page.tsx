'use client'

import React, { useState, useEffect } from 'react';

interface InventoryItem {
  id: string;
  item: string;
  quantity: number;
  unit_type: string;
  max_capacity: number | null;
  reserved_quantity: number;
  percentage_left: number | null;
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const response = await fetch('http://localhost:5000/get_stock', {
          credentials: 'include',
        });
        const data = await response.json();
        if (data.success) {
          setItems(data.stock);
        } else {
          console.error('Failed to fetch stock.');
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStock();
  }, []);

  return (
    <main className="min-h-screen p-6" style={{ backgroundColor: 'var(--primary-2)' }}>

      <h1 className="text-4xl font-bold mb-6" style={{ color: 'var(--primary-3)' }}>
        Inventory Stock
      </h1>

      {loading ? (
        <p className="text-lg" style={{ color: 'var(--primary-3)' }}>Loading stock...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow-lg" style={{ backgroundColor: 'var(--primary-2)' }}>
          <table className="min-w-full divide-y" style={{ borderColor: 'var(--primary-3)' }}>
            <thead style={{ backgroundColor: 'var(--primary-4)' }}>
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: 'var(--primary-3)' }}>Item</th>
                <th className="px-4 py-3 text-right text-sm font-medium" style={{ color: 'var(--primary-3)' }}>Quantity</th>
                <th className="px-4 py-3 text-right text-sm font-medium" style={{ color: 'var(--primary-3)' }}>Unit</th>
                <th className="px-4 py-3 text-right text-sm font-medium" style={{ color: 'var(--primary-3)' }}>% Left</th>
                <th className="px-4 py-3 text-right text-sm font-medium" style={{ color: 'var(--primary-3)' }}>Max Capacity</th>
                <th className="px-4 py-3 text-right text-sm font-medium" style={{ color: 'var(--primary-3)' }}>Reserved</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--primary-3)' }}>
              {items.map(item => (
                <tr key={item.id}>
                  <td className="px-4 py-2" style={{ color: 'var(--primary-3)' }}>{item.item}</td>
                  <td className="px-4 py-2 text-right" style={{ color: 'var(--primary-3)' }}>{item.quantity}</td>
                  <td className="px-4 py-2 text-right" style={{ color: 'var(--primary-3)' }}>{item.unit_type}</td>
                  <td className="px-4 py-2 text-right" style={{ color: 'var(--primary-3)' }}>
                    {item.percentage_left !== null ? `${item.percentage_left}%` : 'N/A'}
                  </td>
                  <td className="px-4 py-2 text-right" style={{ color: 'var(--primary-3)' }}>
                    {item.max_capacity !== null ? item.max_capacity : '∞'}
                  </td>
                  <td className="px-4 py-2 text-right" style={{ color: 'var(--primary-3)' }}>{item.reserved_quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
