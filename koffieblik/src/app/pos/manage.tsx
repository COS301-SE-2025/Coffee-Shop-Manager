'use client'

import { useOrderStore } from '../store/orders'


export default function ManageOrders() {
  const { orders, setStatus } = useOrderStore()

  const processing = orders.filter((o) => o.status === 'Processing')
  const uncollected = orders.filter((o) => o.status === 'Uncollected')

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Manage Orders</h1>

      <h2 className="text-lg font-semibold">Processing Orders</h2>
      {processing.length === 0 ? (
        <p>No processing orders.</p>
      ) : (
        <ul className="mb-6">
          {processing.map((order) => (
            <li key={order.id} className="mb-2">
              Order #{order.id} - {order.quantity} item(s) at ${order.price} each
              <button
                onClick={() => setStatus(order.id, 'Uncollected')}
                className="ml-4 px-2 py-1 bg-green-500 text-white rounded"
              >
                Mark Uncollected
              </button>
            </li>
          ))}
        </ul>
      )}

      <h2 className="text-lg font-semibold">Uncollected Orders</h2>
      {uncollected.length === 0 ? (
        <p>No uncollected orders.</p>
      ) : (
        <ul>
          {uncollected.map((order) => (
            <li key={order.id} className="mb-2">
              Order #{order.id} - {order.quantity} item(s) at ${order.price} each
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
