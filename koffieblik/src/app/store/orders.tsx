// store/orders.ts
import { create } from "zustand";

export type OrderStatus = "Processing" | "Uncollected" | "Collected";

export interface Order {
  id: number;
  userId: number;
  productId: number;
  price: number;
  quantity: number;
  orderDate: string;
  status: OrderStatus;
}

interface OrderInput {
  userId: number;
  productId: number;
  price: number;
  quantity: number;
  orderDate: string;
}

interface OrderStore {
  orders: Order[];
  addOrder: (order: OrderInput) => void;
  setStatus: (id: number, status: OrderStatus) => void;
}

let orderCounter = 1;

export const useOrderStore = create<OrderStore>((set) => ({
  orders: [],
  addOrder: (order) =>
    set((state) => ({
      orders: [
        ...state.orders,
        {
          ...order,
          id: orderCounter++,
          status: "Processing",
        },
      ],
    })),
  setStatus: (id, status) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
    })),
}));
