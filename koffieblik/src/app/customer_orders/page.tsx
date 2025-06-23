'use client';

import { useState } from 'react';

const mockCoffees = [
  { name: 'Cappuccino', image: '☕', description: 'Frothy and smooth' },
  { name: 'Espresso', image: '🍫', description: 'Strong and bold' },
  { name: 'Latte', image: '🥛', description: 'Mild and milky' },
  { name: 'Mocha', image: '🍫☕', description: 'Choco-coffee mix' },
  { name: 'Americano', image: '💧☕', description: 'Diluted and clean' },
];

export default function CustomerOrders() {
  const [order, setOrder] = useState({
    name: '',
    coffee: '',
    size: 'Medium',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setOrder((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!order.coffee) {
      alert('❗ Please select a coffee type.');
      return;
    }
    alert(`✅ Order placed!\n\nName: ${order.name}\nCoffee: ${order.coffee}\nSize: ${order.size}`);
    // TODO: send to backend
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-xl border border-amber-100"
      >
        <h1 className="text-2xl font-bold text-amber-800 mb-6 text-center">☕ Place Your Coffee Order</h1>

        {/* Name input */}
        <label className="block text-sm font-medium text-amber-700 mb-1">Your Name</label>
        <input
          type="text"
          name="name"
          value={order.name}
          onChange={handleChange}
          required
          className="w-full p-3 mb-6 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
          placeholder="e.g. Sipho"
        />

        {/* Coffee selection */}
        <label className="block text-sm font-medium text-amber-700 mb-3">Choose Your Coffee</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          {mockCoffees.map((coffee) => (
            <div
              key={coffee.name}
              onClick={() => setOrder((prev) => ({ ...prev, coffee: coffee.name }))}
              className={`cursor-pointer p-4 rounded-xl shadow-md border transition ${
                order.coffee === coffee.name
                  ? 'bg-amber-200 border-amber-400'
                  : 'bg-amber-50 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <div className="text-4xl text-center">{coffee.image}</div>
              <h3 className="text-lg font-semibold text-center text-amber-800 mt-2">{coffee.name}</h3>
              <p className="text-sm text-center text-amber-600">{coffee.description}</p>
            </div>
          ))}
        </div>

        {/* Size selection */}
        <label className="block text-sm font-medium text-amber-700 mb-1">Size</label>
        <select
          name="size"
          value={order.size}
          onChange={handleChange}
          className="w-full p-3 mb-6 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <option>Small</option>
          <option>Medium</option>
          <option>Large</option>
        </select>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-amber-500 text-white py-3 rounded-lg font-semibold hover:bg-amber-600 transition"
        >
          Submit Order
        </button>
      </form>
    </main>
  );
}
