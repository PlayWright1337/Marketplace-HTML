"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, PackageCheck, Settings, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AuthForm } from "@/components/auth-form";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { money } from "@/lib/utils";
import type { Account, Purchase } from "@/lib/types";
import { useAuthStore } from "@/store/auth-store";
import { useFavoritesStore } from "@/store/favorites-store";

export function DashboardClient({ view }: { view: "profile" | "orders" | "favorites" }) {
  const { user, token, logout, hydrateMe } = useAuthStore();
  const { products } = useFavoritesStore();
  const [account, setAccount] = useState<Account | null>(null);
  const [orders, setOrders] = useState<Purchase[]>([]);

  useEffect(() => {
    hydrateMe();
  }, [hydrateMe]);

  useEffect(() => {
    api.account(token).then(setAccount).catch(() => undefined);
    api.purchases(token).then(setOrders).catch(() => undefined);
  }, [token]);

  const navItems: Array<[string, string, LucideIcon, boolean]> = [
    ["/dashboard", "Профиль", UserRound, view === "profile"],
    ["/dashboard/orders", "Заказы", PackageCheck, view === "orders"],
    ["/dashboard/favorites", "Избранное", Heart, view === "favorites"],
    ["/dashboard", "Настройки", Settings, false]
  ];

  if (!user) {
    return (
      <div className="container-fluid grid min-h-[70vh] place-items-center py-12">
        <div className="w-full max-w-md">
          <AuthForm />
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid grid gap-8 py-10 lg:grid-cols-[260px_1fr]">
      <motion.aside
        initial={{ opacity: 0, x: -18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }}
        className="premium-card h-fit p-4 lg:sticky lg:top-28"
      >
        <nav className="grid gap-2">
          {navItems.map(([href, label, Icon, active]) => (
            <Link
              key={label}
              href={href}
              className={`group relative flex items-center gap-3 overflow-hidden rounded-2xl px-4 py-3 text-sm font-bold transition-colors ${active ? "text-white" : "text-slate-600 hover:text-slate-950"}`}
            >
              {active && <motion.span layoutId="dashboard-nav-active" className="absolute inset-0 rounded-2xl bg-slate-950" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className="relative z-10 grid h-8 w-8 place-items-center rounded-xl border border-current/15 transition-transform duration-200 group-hover:scale-105">
                <Icon size={18} />
              </span>
              <span className="relative z-10">{label}</span>
            </Link>
          ))}
        </nav>
      </motion.aside>

      <motion.section
        key={view}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
      >
        {view === "profile" && (
          <div className="premium-card p-7">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="grid h-24 w-24 place-items-center rounded-3xl border border-slate-950 bg-slate-950 text-3xl font-extrabold text-white shadow-[0_18px_40px_rgba(15,23,42,.18)]">
                {user.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">{user.name}</h1>
                <p className="mt-1 text-slate-500">{user.email}</p>
              </div>
              <Button variant="secondary" onClick={logout}>Выйти</Button>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 p-5">
                <span className="text-sm font-bold text-slate-500">Баланс</span>
                <strong className="mt-3 block text-3xl font-extrabold">{money(account?.balance || 0)}</strong>
              </div>
              <div className="rounded-2xl border border-slate-200 p-5">
                <span className="text-sm font-bold text-slate-500">Заказы</span>
                <strong className="mt-3 block text-3xl font-extrabold">{orders.length}</strong>
              </div>
              <div className="rounded-2xl border border-slate-200 p-5">
                <span className="text-sm font-bold text-slate-500">Избранное</span>
                <strong className="mt-3 block text-3xl font-extrabold">{products.length}</strong>
              </div>
            </div>
          </div>
        )}

        {view === "orders" && (
          <div className="premium-card overflow-hidden p-7">
            <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-slate-900">Заказы</h1>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left">
                <thead className="text-sm text-slate-500">
                  <tr><th className="py-3">Товар</th><th>Дата</th><th>Сумма</th><th>Статус</th></tr>
                </thead>
                <tbody>
                  {orders.map((order, index) => (
                    <tr key={order.id || index} className="border-t border-slate-200">
                      <td className="py-4 font-bold">{order.product?.name || "Товар"}</td>
                      <td className="text-slate-500">{new Date(order.createdAt).toLocaleDateString("ru-RU")}</td>
                      <td className="font-bold">{money(order.price)}</td>
                      <td><span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-white">Доставлен</span></td>
                    </tr>
                  ))}
                  {orders.length === 0 && <tr><td colSpan={4} className="py-10 text-center text-slate-500">Заказов пока нет</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === "favorites" && (
          <div>
            <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-slate-900">Избранное</h1>
            <div className="grid gap-4 md:grid-cols-2">
              {products.map((product) => (
                <Link key={product.id} href={`/product/${product.id}`} className="premium-card grid grid-cols-[96px_1fr] gap-4 p-3">
                  <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100">
                    <Image src={product.image} alt={product.name} fill sizes="96px" className="object-cover" />
                  </div>
                  <div className="min-w-0 self-center">
                    <h2 className="truncate font-extrabold text-slate-900">{product.name}</h2>
                    <p className="text-sm text-slate-500">{product.seller}</p>
                    <strong className="mt-2 block text-slate-950">{money(product.price)}</strong>
                  </div>
                </Link>
              ))}
              {products.length === 0 && <div className="premium-card p-8 text-center text-slate-500 md:col-span-2">Избранных товаров пока нет</div>}
            </div>
          </div>
        )}
      </motion.section>
    </div>
  );
}
