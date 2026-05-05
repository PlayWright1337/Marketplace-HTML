"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/lib/types";

type FavoritesState = {
  products: Product[];
  toggle: (product: Product) => void;
  has: (id: string) => boolean;
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      products: [],
      toggle(product) {
        const exists = get().products.some((item) => item.id === product.id);
        set({ products: exists ? get().products.filter((item) => item.id !== product.id) : [product, ...get().products] });
      },
      has(id) {
        return get().products.some((item) => item.id === id);
      }
    }),
    { name: "marketplace-favorites" }
  )
);
