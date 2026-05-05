"use client";

import { Heart, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/types";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { useFavoritesStore } from "@/store/favorites-store";

export function ProductActions({ product }: { product: Product }) {
  const { token } = useAuthStore();
  const { add } = useCartStore();
  const { toggle, has } = useFavoritesStore();

  return (
    <div className="mt-7 grid gap-3 sm:grid-cols-[1fr_auto]">
      <Button size="lg" onClick={() => add(product, token)}>
        <ShoppingBag size={19} /> Добавить в корзину
      </Button>
      <Button size="lg" variant="secondary" onClick={() => toggle(product)} className="px-5">
        <Heart size={19} fill={has(product.id) ? "#0F172A" : "none"} /> В избранное
      </Button>
    </div>
  );
}
