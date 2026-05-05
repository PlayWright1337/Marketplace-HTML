"use client";

import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { money } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";

export function CartDrawer() {
  const { token } = useAuthStore();
  const { items, isOpen, close, remove, total } = useCartStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Закрыть корзину"
            className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.aside
            className="fixed right-0 top-0 z-[80] flex h-full w-full max-w-[400px] flex-col bg-white p-5 shadow-card-hover"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">Корзина</h2>
                <p className="text-sm text-slate-500">{items.length} товаров</p>
              </div>
              <button className="icon-button" type="button" onClick={close} aria-label="Закрыть">
                <X size={20} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="grid flex-1 place-items-center text-center">
                <div>
                  <div className="mx-auto mb-5 grid h-24 w-24 place-items-center rounded-3xl bg-slate-100 text-4xl">✓</div>
                  <h3 className="mb-2 text-xl font-bold">Корзина пустая</h3>
                  <p className="mb-5 text-sm text-slate-500">Добавьте товары из каталога, чтобы оформить заказ.</p>
                  <Link href="/catalog" onClick={close}>
                    <Button>Перейти в каталог</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent grid flex-1 gap-3 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="grid grid-cols-[72px_1fr] gap-3 rounded-2xl border border-slate-200 bg-white p-3">
                      <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100">
                        {item.product?.image && <Image src={item.product.image} alt={item.product.name} fill sizes="72px" className="object-cover" />}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold text-slate-900">{item.product?.name}</h3>
                        <p className="text-sm font-semibold text-slate-950">{money(item.product?.price || 0)}</p>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center rounded-full border border-slate-200">
                            <button className="grid h-8 w-8 place-items-center text-slate-500" type="button"><Minus size={14} /></button>
                            <span className="px-2 text-sm font-bold">1</span>
                            <button className="grid h-8 w-8 place-items-center text-slate-500" type="button"><Plus size={14} /></button>
                          </div>
                          <button className="text-xs font-bold text-red-500" type="button" onClick={() => remove(item.id, token)}>
                            Убрать
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 border-t border-slate-200 pt-5">
                  <div className="mb-4 flex items-center justify-between text-lg font-extrabold">
                    <span>Итого</span>
                    <motion.span key={total()} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                      {money(total())}
                    </motion.span>
                  </div>
                  <Link href="/checkout" onClick={close}>
                    <Button size="lg" className="w-full">Оформить заказ</Button>
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
