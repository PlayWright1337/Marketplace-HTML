"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Product } from "@/lib/types";

const tabs = [
  { id: "description", label: "Описание" },
  { id: "specs", label: "Характеристики" },
  { id: "reviews", label: "Отзывы" }
] as const;

export function ProductTabs({ product }: { product: Product }) {
  const [active, setActive] = useState<(typeof tabs)[number]["id"]>("description");

  return (
    <div className="premium-card p-7">
      <div className="mb-6 flex flex-wrap gap-2 rounded-2xl bg-slate-100 p-1">
        {tabs.map((tab) => {
          const selected = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className={`relative rounded-xl px-4 py-3 text-sm font-bold transition-colors ${selected ? "text-white" : "text-slate-500 hover:text-slate-950"}`}
            >
              {selected && <motion.span layoutId="product-tab-active" className="absolute inset-0 rounded-xl bg-slate-950" transition={{ type: "spring", stiffness: 430, damping: 35 }} />}
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <motion.div
        key={active}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        className="max-w-3xl leading-8 text-slate-600"
      >
        {active === "description" && (
          <p>
            {product.description} В комплект входят исходники, коммерческая лицензия, документация и обновления версии.
          </p>
        )}
        {active === "specs" && (
          <dl className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-4"><dt className="text-sm font-bold text-slate-900">Формат</dt><dd>Цифровой товар</dd></div>
            <div className="rounded-2xl border border-slate-200 p-4"><dt className="text-sm font-bold text-slate-900">Лицензия</dt><dd>Commercial use</dd></div>
            <div className="rounded-2xl border border-slate-200 p-4"><dt className="text-sm font-bold text-slate-900">Продавец</dt><dd>{product.seller}</dd></div>
            <div className="rounded-2xl border border-slate-200 p-4"><dt className="text-sm font-bold text-slate-900">Категория</dt><dd>{product.label}</dd></div>
          </dl>
        )}
        {active === "reviews" && (
          <div className="rounded-2xl border border-slate-200 p-5">
            <div className="mb-2 text-2xl font-extrabold text-slate-950">{product.rating.toFixed(1)} / 5</div>
            <p>Покупатели отмечают аккуратную сборку, понятную структуру файлов и быстрый старт без лишней настройки.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
