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
  tax: number;
  total: number;
}

export default function OrderPage() {

}