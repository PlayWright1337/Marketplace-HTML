"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { money } from "@/lib/utils";
import type { Product } from "@/lib/types";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { useFavoritesStore } from "@/store/favorites-store";

export function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const [added, setAdded] = useState(false);
  const { token } = useAuthStore();
  const { add } = useCartStore();
  const { toggle, has } = useFavoritesStore();
  const isFavorite = has(product.id);
  const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;

  async function addProduct() {
    await add(product, token);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      className="group min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-slate-950/30 hover:shadow-card-hover"
    >
      <Link href={`/product/${product.id}`} className="block">
        <div className={compact ? "relative aspect-[4/3] overflow-hidden bg-slate-100" : "relative aspect-[4/3] overflow-hidden bg-slate-100"}>
          <Image src={product.image} alt={product.name} fill sizes="(max-width: 768px) 100vw, 320px" className="object-cover saturate-75 transition-transform duration-300 group-hover:scale-105" />
          <div className="absolute inset-0 bg-slate-900/25 transition-opacity group-hover:opacity-60" />
          {discount > 0 && <Badge className="absolute left-4 top-4 bg-slate-950 text-white">-{discount}%</Badge>}
          <button
            type="button"
            aria-label="В избранное"
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-2xl bg-white/90 text-slate-700 backdrop-blur transition-colors duration-150 hover:bg-slate-950 hover:text-white"
            onClick={(event) => {
              event.preventDefault();
              toggle(product);
            }}
          >
            <Heart size={18} fill={isFavorite ? "#0F172A" : "none"} />
          </button>
        </div>
      </Link>

      <div className="grid gap-4 p-5">
        <div>
          <div className="mb-2 flex items-center justify-between gap-2 text-xs font-semibold uppercase text-slate-500">
            <span>{product.seller}</span>
            <span className="inline-flex items-center gap-1 text-slate-950"><Star size={14} fill="currentColor" /> {product.rating.toFixed(1)}</span>
          </div>
          <Link href={`/product/${product.id}`} className="line-clamp-2 text-xl font-extrabold tracking-tight text-slate-900 transition-colors hover:text-slate-600">
            {product.name}
          </Link>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div>
            {product.oldPrice && <div className="text-sm font-semibold text-slate-400 line-through">{money(product.oldPrice)}</div>}
            <div className="text-2xl font-extrabold text-slate-900">{money(product.price)}</div>
          </div>
          <Button type="button" variant={added ? "secondary" : "primary"} onClick={addProduct} className={added ? "text-slate-950" : ""}>
            <ShoppingBag size={17} />
            {added ? "Добавлено" : "В корзину"}
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
