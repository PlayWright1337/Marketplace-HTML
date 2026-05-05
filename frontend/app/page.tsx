import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getCategories, getProducts } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";

export default async function HomePage() {
  const [categories, bestsellers] = await Promise.all([getCategories(), getProducts({ sort: "popular", limit: "6" })]);
  const benefits: Array<[LucideIcon, string, string]> = [
    [ShieldCheck, "Безопасные покупки", "Корзина, checkout и баланс работают через единый API-слой."],
    [Truck, "Мгновенный доступ", "Цифровые товары доступны сразу после оплаты."],
    [Sparkles, "Premium Fluid UI", "Мягкие тени, светлая тема и плавные микроанимации."]
  ];

  return (
    <>
      <section className="relative min-h-[90vh] overflow-hidden bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_48%,#e5e7eb_100%)]">
        <div className="absolute -left-32 top-20 h-[600px] w-[600px] animate-float rounded-full bg-slate-300/35 blur-[120px]" />
        <div className="absolute right-0 top-32 h-[520px] w-[520px] animate-float-slow rounded-full bg-slate-950/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-[460px] w-[460px] animate-float rounded-full bg-white/60 blur-[120px]" />
        <div className="container-fluid relative grid min-h-[90vh] items-center py-20">
          <div className="max-w-4xl">
            <div className="mb-6 inline-grid grid-cols-2 rounded-full bg-white/70 p-1 shadow-card backdrop-blur">
              <span className="rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white">Покупать</span>
              <span className="px-6 py-3 text-sm font-bold text-slate-500">Продавать</span>
            </div>
            <h1 className="max-w-4xl text-5xl font-extrabold leading-[.95] tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
              Marketplace цифровых товаров
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-500">
              Лёгкий premium-каталог с товарами из API, корзиной, избранным, формами и страницами, готовыми к подключению настоящего сервера.
            </p>
            <Link href="/catalog" className="mt-8 inline-flex">
              <Button size="lg">Начать покупки <ArrowRight size={19} /></Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="container-fluid py-20">
        <h2 className="mb-8 text-4xl font-bold tracking-tight text-slate-900">Популярные категории</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.slice(0, 6).map((category) => (
            <Link key={category.id} href={`/catalog?category=${category.id}`} className="group relative aspect-[4/3] overflow-hidden rounded-3xl shadow-card transition-transform hover:-translate-y-1">
              {category.image && <Image src={category.image} alt={category.label} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover saturate-50 transition-transform duration-300 group-hover:scale-105" />}
              <div className="absolute inset-0 bg-slate-900/30 transition-opacity group-hover:bg-slate-900/20" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <div className="mb-3 inline-flex rounded-2xl bg-white/20 p-3 backdrop-blur"><Sparkles size={22} /></div>
                <h3 className="text-2xl font-extrabold">{category.label}</h3>
                <p className="text-sm text-white/80">{category.count} товаров</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-fluid py-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <h2 className="text-4xl font-bold tracking-tight text-slate-900">Бестселлеры</h2>
          <Link href="/catalog" className="font-bold text-slate-950">Смотреть все</Link>
        </div>
        <div className="scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent flex snap-x gap-6 overflow-x-auto pb-6">
          {bestsellers.products.map((product) => (
            <div key={product.id} className="w-[280px] flex-none snap-start">
              <ProductCard product={product} compact />
            </div>
          ))}
        </div>
      </section>

      <section className="relative mt-14 bg-slate-50 py-20 before:absolute before:inset-x-0 before:-top-10 before:h-10 before:bg-[radial-gradient(100%_40px_at_50%_40px,#f8fafc_48%,transparent_52%)]">
        <div className="container-fluid grid gap-6 md:grid-cols-3">
          {benefits.map(([Icon, title, text]) => (
            <div key={String(title)} className="premium-card p-7">
              <Icon className="mb-5 text-slate-950" size={30} />
              <h3 className="mb-2 text-xl font-extrabold text-slate-900">{String(title)}</h3>
              <p className="leading-7 text-slate-500">{String(text)}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
