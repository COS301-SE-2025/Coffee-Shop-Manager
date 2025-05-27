'use client';

import { useEffect, useState } from 'react';

interface CartItem {
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  user_id: string;
  customer: string;
  items: CartItem[];
  total: number;
  date: string;
  status: 'pending' | 'processing' | 'finished';
}

export default function ManageOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const savedOrdersRaw = JSON.parse(localStorage.getItem('mockOrders') || '[]');

    // Ensure each order has a valid status
    const validatedOrders: Order[] = savedOrdersRaw.map((order: any) => ({
      ...order,
      status: order.status || 'pending',
    }));

    setOrders(validatedOrders);
  }, []);

  const updateOrderStatus = (index: number) => {
    const updated = [...orders];
    const currentStatus = updated[index].status;

    updated[index].status =
      currentStatus === 'pending'
        ? 'processing'
        : currentStatus === 'processing'
        ? 'finished'
        : 'finished';

    setOrders(updated);
    localStorage.setItem('mockOrders', JSON.stringify(updated));
  };

  const clearOrders = () => {
    localStorage.removeItem('mockOrders');
    setOrders([]);
  };

  const removeOrder = (index: number) => {
    const updated = [...orders];
    updated.splice(index, 1);
    setOrders(updated);
    localStorage.setItem('mockOrders', JSON.stringify(updated));
  };

  return (
    <main className="min-h-screen bg-amber-100 p-8 text-amber-900">
      <h1 className="text-4xl font-bold mb-6">📦 Manage Orders</h1>

      {orders.length === 0 ? (
        <p className="text-gray-600">No orders found.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order, index) => (
            <div
              key={index}
              className={`rounded-xl shadow p-6 relative ${
                order.status === 'finished'
                  ? 'bg-green-100'
                  : order.status === 'processing'
                  ? 'bg-yellow-100'
                  : 'bg-white'
              }`}
            >
              <h2 className="text-xl font-semibold mb-2">
                {order.customer} (ID: {order.user_id})
              </h2>
              <p className="text-sm text-gray-500 mb-3">Date: {order.date}</p>
              <p className="mb-3 text-sm">
                Status:{' '}
                <span
                  className={`font-bold ${
                    order.status === 'pending'
                      ? 'text-red-600'
                      : order.status === 'processing'
                      ? 'text-yellow-600'
                      : 'text-green-600'
                  }`}
                >
                  {(order.status || 'pending').toUpperCase()}
                </span>
              </p>
              <ul className="mb-3">
                {order.items.map((item, idx) => (
                  <li key={idx} className="flex justify-between border-b py-1">
                    <span>{item.name} x{item.quantity}</span>
                    <span>R{item.price * item.quantity}</span>
                  </li>
                ))}
              </ul>
              <p className="font-bold mb-4">Total: R{order.total}</p>

              <div className="flex gap-4">
                {order.status !== 'finished' && (
                  <button
                    onClick={() => updateOrderStatus(index)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Mark as {order.status === 'pending' ? 'Processing' : 'Finished'}
                  </button>
                )}
                <button
                  onClick={() => removeOrder(index)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  🗑 Clear Order
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {orders.length > 0 && (
        <button
          onClick={clearOrders}
          className="mt-8 px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800"
        >
          Clear All Orders
        </button>
      )}
    </main>
  );
}
