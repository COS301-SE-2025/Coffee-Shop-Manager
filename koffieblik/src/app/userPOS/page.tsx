'use client';

import React, { useState } from 'react';
import { useState as useStateHook } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
}

interface CartItem extends MenuItem {
  quantity: number;
}

interface OrderSummary {
  items: CartItem[];
  subtotal: number;
  total: number;
}

export default function OrderPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('coffee');
  const [orderStatus, setOrderStatus] = useState<'ordering' | 'confirming' | 'placed'>('ordering');

  //  menu items -mock data 
  const menuItems: MenuItem[] = [
    { id: 1, name: 'Espresso', description: 'Rich and bold single shot', price: 20.00, category: 'coffee' },
    { id: 2, name: 'Cappuccino', description: 'Espresso with steamed milk foam', price: 25.00, category: 'coffee' },
    { id: 3, name: 'Latte', description: 'Smooth espresso with steamed milk', price: 22.00, category: 'coffee' },
    { id: 4, name: 'Americano', description: 'Espresso with hot water', price: 30.00, category: 'coffee' },
    { id: 5, name: 'Mocha', description: 'Chocolate and espresso delight', price: 30.00, category: 'coffee' },
    { id: 6, name: 'iced coffee', description: 'Smooth cold-brewed coffee', price: 40.00, category: 'cold' },
    { id: 7, name: 'Iced Latte', description: 'Chilled latte with ice', price: 47.00, category: 'cold' },
    { id: 8, name: 'Frappuccino', description: 'Blended coffee drink', price: 40.00, category: 'cold' },
    { id: 9, name: 'Croissant', description: 'Buttery, flaky pastry', price: 15.00, category: 'food' },
    { id: 10, name: 'Muffin', description: 'Fresh baked blueberry muffin', price: 15.00, category: 'food' },
    { id: 11, name: 'Sandwich', description: 'Turkey and cheese on sourdough', price: 25.00, category: 'food' },
  ];

  const categories = [
    { id: 'coffee', name: 'Hot Coffee'},
    { id: 'cold', name: 'Cold Drinks' },
    { id: 'food', name: 'Food' },
  ];

  const addToCart = (item: MenuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (itemId: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === itemId);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(cartItem =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
      } else {
        return prevCart.filter(cartItem => cartItem.id !== itemId);
      }
    });
  };

  const getCartItemQuantity = (itemId: number): number => {
    const item = cart.find(cartItem => cartItem.id === itemId);
    return item ? item.quantity : 0;
  };

  const getOrderSummary = (): OrderSummary => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const total = subtotal;
    
    return {
      items: cart,
      subtotal,
      total
    };
  };

  const handlePlaceOrder = () => {
    setOrderStatus('confirming');
    // Simulate order processing
    setTimeout(() => {
      setOrderStatus('placed');
      setCart([]); // Clear cart after order is placed
    }, 2000);
  };

  const filteredItems = menuItems.filter(item => item.category === activeCategory);
  const orderSummary = getOrderSummary();

  if (orderStatus === 'placed') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <div className="mb-4">
            <span className="text-6xl">✅</span>
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{color: 'var(--primary-3)'}}>Order Placed Successfully!</h2>
          <p className="text-gray-600 mb-4">Your order is being prepared. Estimated time: 15-20 minutes</p>
          <button 
            onClick={() => setOrderStatus('ordering')} 
            className="btn"
          >
            Place Another Order
          </button>
        </div>
      </div>
    );
  }

   return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--primary-4)'}}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b" style={{backgroundColor: 'var(--primary-4)', borderColor: 'var(--primary-4)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold" style={{color: 'var(--primary-3)'}}>Order Online</h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <span className="text-2xl">🛒</span>
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Menu Section */}
          <div className="lg:col-span-2">
            {/* Category Tabs */}
            <div className="mb-8">
              <nav className="flex space-x-1 rounded-lg p-1" style={{backgroundColor: 'var(--primary-4)'}}>
                {categories.map((category) => {
                  return (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`flex items-center px-4 py-2 rounded-md font-medium transition-colors ${
                        activeCategory === category.id
                          ? 'text-white'
                          : 'tr-hover'
                      }`}
                      style={activeCategory === category.id ? {backgroundColor: 'var(--primary-3)'} : {}}
                    >
                      <span className="mr-2">{}</span>
                      {category.name}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Menu Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredItems.map((item) => {
                const quantity = getCartItemQuantity(item.id);
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden border"
                    style={{borderColor: 'var(--primary-4)'}}
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-semibold" style={{color: 'var(--primary-3)'}}>{item.name}</h3>
                        <div className="flex items-center" style={{color: 'var(--primary-3)'}}>
                          <span className="text-lg font-bold">R{item.price.toFixed(2)}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4">{item.description}</p>
                      
                      {/* Add to Cart Controls */}
                      <div className="flex items-center justify-between">
                        {quantity === 0 ? (
                          <button
                            onClick={() => addToCart(item)}
                            className="btn flex-1"
                          >
                            <span className="mr-2">+</span>
                            Add to Cart
                          </button>
                        ) : (
                          <div className="flex items-center space-x-3 flex-1">
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="w-8 h-8 rounded-full flex items-center justify-center"
                              style={{backgroundColor: 'var(--primary-4)', color: 'var(--primary-3)'}}
                            >
                              <span className="text-lg font-bold">−</span>
                            </button>
                            <span className="font-semibold text-lg min-w-[2rem] text-center" style={{color: 'var(--primary-3)'}}>{quantity}</span>
                            <button
                              onClick={() => addToCart(item)}
                              className="w-8 h-8 rounded-full flex items-center justify-center"
                              style={{backgroundColor: 'var(--primary-3)', color: 'var(--primary-2)'}}
                            >
                              <span className="text-lg font-bold">+</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cart/Order Summary */}
          <div className="lg:col-span-1 mt-8 lg:mt-0">
            <div className="sticky top-24">
              <div className="bg-white rounded-lg shadow-lg border" style={{borderColor: 'var(--primary-4)'}}>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-4" style={{color: 'var(--primary-3)'}}>
                    Your Order {cart.length > 0 && `(${cart.reduce((sum, item) => sum + item.quantity, 0)} items)`}
                  </h3>
                  
                  {cart.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Your cart is empty</p>
                  ) : (
                    <>
                      {/* Cart Items */}
                      <div className="space-y-3 mb-6">
                        {cart.map((item) => (
                          <div key={item.id} className="flex justify-between items-center py-2 border-b" style={{borderColor: 'var(--primary-4)'}}>
                            <div className="flex-1">
                              <h4 className="font-medium" style={{color: 'var(--primary-3)'}}>{item.name}</h4>
                              <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold" style={{color: 'var(--primary-3)'}}>
                                R{(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Order Summary */}
                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>R{orderSummary.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          
                          
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2" style={{borderColor: 'var(--primary-4)', color: 'var(--primary-3)'}}>
                          <span>Total:</span>
                          <span>R{orderSummary.total.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Place Order Button */}
                      <button
                        onClick={handlePlaceOrder}
                        disabled={orderStatus === 'confirming'}
                        className="btn w-full text-lg py-3"
                      >
                        {orderStatus === 'confirming' ? 'Processing...' : 'Place Order'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
   );
}