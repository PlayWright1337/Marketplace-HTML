"use client";

import { create } from "zustand";
import { api } from "@/lib/api";
import type { CartItem, Product } from "@/lib/types";

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  loading: boolean;
  lastAddedId: string;
  open: () => void;
  close: () => void;
  load: (token?: string) => Promise<void>;
  add: (product: Product, token?: string) => Promise<void>;
  remove: (id: string, token?: string) => Promise<void>;
  clearLocal: () => void;
  total: () => number;
  count: () => number;
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isOpen: false,
  loading: false,
  lastAddedId: "",
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  async load(token) {
    set({ loading: true });
    try {
      const items = await api.cart(token);
      set({ items, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  async add(product, token) {
    set({ loading: true });
    try {
      const item = await api.addToCart(product.id, token);
      const exists = get().items.some((cartItem) => cartItem.id === item.id || cartItem.productId === product.id);
      set({
        items: exists ? get().items : [{ ...item, product: item.product || product, quantity: 1 }, ...get().items],
        lastAddedId: product.id,
        isOpen: true,
        loading: false
      });
    } catch {
      const id = `local-${product.id}`;
      const exists = get().items.some((item) => item.productId === product.id);
      set({
        items: exists ? get().items : [{ id, productId: product.id, product, quantity: 1 }, ...get().items],
        lastAddedId: product.id,
        isOpen: true,
        loading: false
      });
    }
  },
  async remove(id, token) {
    const before = get().items;
    set({ items: before.filter((item) => item.id !== id) });
    if (!id.startsWith("local-")) {
      try {
        await api.removeFromCart(id, token);
      } catch {
        set({ items: before });
      }
    }
  },
  clearLocal: () => set({ items: [] }),
  total: () => get().items.reduce((sum, item) => sum + Number(item.product?.price || 0) * (item.quantity || 1), 0),
  count: () => get().items.reduce((sum, item) => sum + (item.quantity || 1), 0)
}));
