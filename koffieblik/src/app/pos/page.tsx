'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface MenuItem {
  name: string;
  price: number;
}

interface CartItem extends MenuItem {
  quantity: number;
}

const menu: MenuItem[] = [
  { name: 'Latte', price: 35 },
  { name: 'Espresso', price: 25 },
  { name: 'Cappuccino', price: 40 },
  { name: 'Flat White', price: 35 },
  { name: 'Mocha', price: 40 },
  { name: 'Americano', price: 28 },
  { name: 'Chai Latte', price: 30 },
  { name: 'Macchiato', price: 29 },
  { name: 'Iced Coffee', price: 32 },
  { name: 'Croissant', price: 20 },
];

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [userId, setUserId] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.name === item.name);
      if (existing) {
        return prev.map((ci) =>
          ci.name === item.name ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (name: string) => {
    setCart((prev) => prev.filter((item) => item.name !== name));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const completeOrder = () => {
    // if (!customerName || !userId || cart.length === 0) {
    //   setMessage('Please enter both customer name and user ID, and add items to the cart.');
    //   return;
    // }

    const mockOrder = {
      user_id: userId,
      customer: customerName,
      items: cart,
      total,
      date: new Date().toLocaleString(),
      status: 'pending', // ✅ Add this
    };


    const existingOrders = JSON.parse(localStorage.getItem('mockOrders') || '[]');
    localStorage.setItem('mockOrders', JSON.stringify([...existingOrders, mockOrder]));

    setCart([]);
    setCustomerName('');
    setUserId('');
    setMessage('');


  };

  return (
    <main
      className="min-h-screen p-8"
      style={{
        backgroundColor: 'var(--primary-4)',
        color: 'var(--primary-3)',
      }}
    >

      <h1 className="text-4xl font-bold mb-6">🧾 POS System</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Customer Name"
          className="p-3 rounded-lg w-full"
          style={{
            border: '1px solid var(--primary-3)',
            color: 'var(--primary-3)',
            backgroundColor: 'transparent'
          }}
        />
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="User ID / Cell Number"
          className="p-3 rounded-lg w-full"
          style={{
            border: '1px solid var(--primary-3)',
            color: 'var(--primary-3)',
            backgroundColor: 'transparent'
          }}
        /> */}
       

      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
        {menu.map((item) => (
          <button
            key={item.name}
            onClick={() => addToCart(item)}
            className="rounded-xl p-4 hover:shadow-md"
            style={{
              backgroundColor: 'var(--primary-2)',
              border: '1px solid var(--primary-3)',
              color: 'var(--primary-3)',
            }}
          >
            <h2 className="font-semibold text-lg">{item.name}</h2>
            <p>R{item.price}</p>
          </button>

        ))}
      </div>

      <div
        className="rounded-xl shadow-md p-6 mb-6"
        style={{
          backgroundColor: 'var(--primary-2)',
        }}
      >

        <h2 className="text-xl font-bold mb-4">🛒 Cart</h2>
        {cart.length === 0 ? (
          <p className="text-red-500">Cart is empty.</p>
        ) : (
          <ul>
            {cart.map((item) => (
              <li key={item.name} className="flex justify-between items-center mb-2">
                <span>{item.name} x{item.quantity}</span>
                <div className="flex items-center gap-3">
                  <span className="text-amber-700">R{item.price * item.quantity}</span>
                  <button
                    onClick={() => removeFromCart(item.name)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
            <li className="font-bold mt-4">Total: R{total}</li>
          </ul>
        )}
      </div>

      {message && <p className="mb-4 text-green-700 font-semibold">{message}</p>}

      <button onClick={completeOrder} className="btn">
        Complete Order
      </button>

    </main>
  );
}
