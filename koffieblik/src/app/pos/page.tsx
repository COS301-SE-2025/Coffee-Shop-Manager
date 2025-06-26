'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock_quantity: number;
}

interface CartItem extends MenuItem {
  quantity: number;
}

export default function POSPage() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [userId, setUserId] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('http://localhost:5000/getProducts', {
          credentials: 'include', // include cookies (token)
        });
        const data = await res.json();

        if (data.success) {
          setMenu(data.products);
        } else {
          console.error('Failed to load products:', data.error);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };

    fetchProducts();
  }, []);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const completeOrder = () => {
    const mockOrder = {
      user_id: userId,
      customer: customerName,
      items: cart,
      total,
      date: new Date().toLocaleString(),
      status: 'pending',
    };

    const existingOrders = JSON.parse(localStorage.getItem('mockOrders') || '[]');
    localStorage.setItem('mockOrders', JSON.stringify([...existingOrders, mockOrder]));

    setCart([]);
    setCustomerName('');
    setUserId('');
    setMessage('Order completed!');
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
        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Customer Name"
          className="p-3 rounded-lg w-full"
          style={{
            border: '1px solid var(--primary-3)',
            color: 'var(--primary-3)',
            backgroundColor: 'transparent',
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
            backgroundColor: 'transparent',
          }}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
        {menu.map((item) => (
          <button
            key={item.id}
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
              <li key={item.id} className="flex justify-between items-center mb-2">
                <span>
                  {item.name} x{item.quantity}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-amber-700">R{item.price * item.quantity}</span>
                  <button
                    onClick={() => removeFromCart(item.id)}
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
