'use client';

import { useState } from 'react';

const mockCoffees = [
  {
    name: 'Cappuccino',
    emoji: '☕',
    description: 'A rich espresso with steamed milk and a thick layer of foam.',
    price: 35,
  },
  {
    name: 'Espresso',
    emoji: '🍫',
    description: 'A single shot of strong black coffee — pure energy.',
    price: 25,
  },
  {
    name: 'Latte',
    emoji: '🥛',
    description: 'Smooth blend of espresso and steamed milk, topped with light foam.',
    price: 32,
  },
  {
    name: 'Mocha',
    emoji: '🍫☕',
    description: 'Chocolate and coffee in perfect harmony with steamed milk.',
    price: 38,
  },
  {
    name: 'Americano',
    emoji: '💧☕',
    description: 'Espresso diluted with hot water for a lighter taste.',
    price: 28,
  },
];

export default function CustomerOrders() {
  const [cart, setCart] = useState<
    { name: string; size: string; price: number }[]
  >([]);
  const [size, setSize] = useState('Medium');

  const addToCart = (coffee: typeof mockCoffees[0]) => {
    const sizeMultiplier = size === 'Small' ? 0.9 : size === 'Large' ? 1.2 : 1;
    const adjustedPrice = +(coffee.price * sizeMultiplier).toFixed(2);
    setCart((prev) => [...prev, { name: coffee.name, size, price: adjustedPrice }]);
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0).toFixed(2);

  return (
    <main className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-amber-50 to-orange-100 px-4 py-10">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-5xl border border-amber-100">
        <h1 className="text-2xl font-bold text-amber-800 mb-6 text-center">☕ Select Your Coffee</h1>

        {/* Size selector */}
        <div className="mb-6 text-center">
          <label className="text-sm font-medium text-amber-700 mr-2">Choose Size:</label>
          <select
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="p-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option>Small</option>
            <option>Medium</option>
            <option>Large</option>
          </select>
        </div>

        {/* Coffee Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {mockCoffees.map((coffee) => (
            <div
              key={coffee.name}
              className="bg-amber-50 border border-amber-200 p-4 rounded-xl shadow-sm hover:shadow-md transition"
            >
              <div className="text-4xl text-center mb-2">{coffee.emoji}</div>
              <h3 className="text-lg font-bold text-center text-amber-800">{coffee.name}</h3>
              <p className="text-sm text-center text-amber-700">{coffee.description}</p>
              <p className="text-sm text-center text-amber-600 mt-1">
                Base Price: <strong>R{coffee.price}</strong>
              </p>
              <button
                onClick={() => addToCart(coffee)}
                className="mt-4 w-full bg-amber-500 text-white py-2 rounded-lg font-semibold hover:bg-amber-600 transition"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        {cart.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl shadow-inner">
            <h2 className="text-xl font-bold text-amber-800 mb-4">🛒 Cart Summary</h2>
            <ul className="space-y-2 mb-4">
              {cart.map((item, index) => (
                <li key={index} className="text-amber-800">
                  • {item.name} ({item.size}) – R{item.price.toFixed(2)}
                </li>
              ))}
            </ul>
            <p className="text-lg font-semibold text-amber-900">Total: R{total}</p>
          </div>
        )}
      </div>
    </main>
  );
}
