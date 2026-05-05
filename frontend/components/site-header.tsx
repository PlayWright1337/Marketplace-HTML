"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Heart, Menu, Search, ShoppingBag, SunMoon, UserRound } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { useFavoritesStore } from "@/store/favorites-store";

const navItems = [
  { href: "/catalog", label: "Каталог" },
  { href: "/dashboard", label: "Кабинет" }
];

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const { count, open, load, lastAddedId } = useCartStore();
  const { products } = useFavoritesStore();
  const { token, user, hydrateMe } = useAuthStore();
  const cartCount = count();

  useEffect(() => {
    hydrateMe();
    load(token);
  }, [hydrateMe, load, token]);

  useEffect(() => {
    const saved = localStorage.getItem("marketplace-theme") === "dark";
    setDark(saved);
    document.documentElement.classList.toggle("dark", saved);
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    localStorage.setItem("marketplace-theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) params.set("q", query.trim());
    else params.delete("q");
    params.set("page", "1");
    router.push(`/catalog?${params.toString()}`);
  }

  return (
    <header className="sticky top-0 z-50 px-3 py-3">
      <div className="container-fluid flex min-h-16 items-center gap-3 rounded-[28px] border border-slate-200/80 bg-white/90 py-2 shadow-[0_18px_50px_rgba(15,23,42,.08)] backdrop-blur-xl">
        <button className="icon-button lg:hidden" type="button" onClick={() => setMenuOpen((value) => !value)} aria-label="Меню">
          <Menu size={20} />
        </button>

        <Link href="/" className="group flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-950 bg-slate-950 text-lg font-extrabold text-white shadow-[0_10px_24px_rgba(15,23,42,.18)] transition-all duration-300 group-hover:rotate-3 group-hover:bg-white group-hover:text-slate-950">
            M
          </span>
          <span className="hidden text-lg font-extrabold text-slate-900 sm:block">Marketplace</span>
        </Link>

        <nav className="hidden items-center rounded-2xl bg-slate-100 p-1 lg:flex">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href === "/dashboard" && pathname.startsWith("/dashboard"));
            return (
              <Link key={item.href} className={`relative rounded-xl px-4 py-2 text-sm font-bold transition-colors ${active ? "text-white" : "text-slate-500 hover:text-slate-950"}`} href={item.href}>
                {active && <motion.span layoutId="top-nav-active" className="absolute inset-0 rounded-xl bg-slate-950" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <form onSubmit={submit} className="relative mx-auto hidden w-full max-w-xl sm:block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm font-medium outline-none transition-all focus:w-[104%] focus:border-slate-950 focus:ring-2 focus:ring-slate-950/15"
            placeholder="Поиск товаров, категорий, продавцов"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </form>

        <div className="ml-auto flex items-center gap-2">
          <button className="icon-button" type="button" onClick={toggleTheme} aria-label="Сменить тему">
            <SunMoon size={20} />
          </button>
          <Link className="icon-button relative" href="/dashboard/favorites" aria-label="Избранное">
            <Heart size={20} />
            {products.length > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-slate-950 px-1.5 text-[10px] font-bold text-white">{products.length}</span>}
          </Link>
          <button className="icon-button relative" type="button" onClick={open} aria-label="Корзина">
            <motion.span animate={lastAddedId ? { scale: [1, 1.2, 1] } : { scale: 1 }}>
              <ShoppingBag size={20} />
            </motion.span>
            {cartCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-1 -top-1 rounded-full bg-slate-950 px-1.5 text-[10px] font-bold text-white"
              >
                {cartCount}
              </motion.span>
            )}
          </button>
          <Link href="/dashboard" className="hidden sm:block">
            <Button size="lg" className="h-11 px-5">
              <UserRound size={17} />
              {user ? user.name : "Войти"}
            </Button>
          </Link>
        </div>
      </div>

      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="container-fluid mt-2 grid gap-2 rounded-[24px] border border-slate-200 bg-white p-3 shadow-[0_18px_50px_rgba(15,23,42,.08)] lg:hidden"
        >
          <form onSubmit={submit} className="relative sm:hidden">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input className="h-12 w-full rounded-2xl border border-slate-200 pl-12 pr-4 outline-none focus:border-slate-950" value={query} onChange={(event) => setQuery(event.target.value)} />
          </form>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-2xl bg-slate-50 px-4 py-3 font-semibold text-slate-700">
              {item.label}
            </Link>
          ))}
        </motion.div>
      )}
    </header>
  );
}
