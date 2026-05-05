import { SlidersHorizontal } from "lucide-react";
import { getCategories, getProducts } from "@/lib/api";
import { CatalogControls } from "@/components/catalog-controls";
import { ProductCard } from "@/components/product-card";
import type { ProductQuery } from "@/lib/types";

export default async function CatalogPage({ searchParams }: { searchParams: ProductQuery }) {
  const [categories, result] = await Promise.all([getCategories(), getProducts(searchParams)]);

  return (
    <div className="container-fluid py-10">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-950">
            <SlidersHorizontal size={16} /> API-параметры: search, filters, sort, page
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 lg:text-5xl">Каталог товаров</h1>
          <p className="mt-3 max-w-2xl text-slate-500">Фильтры, сортировка и пагинация управляются URL-параметрами и передаются в API-адаптер.</p>
        </div>
        <form className="flex gap-3" action="/catalog">
          <select name="sort" defaultValue={searchParams.sort || "popular"} className="premium-input min-w-52">
            <option value="popular">Популярные</option>
            <option value="rating">По рейтингу</option>
            <option value="price-asc">Сначала дешевле</option>
            <option value="price-desc">Сначала дороже</option>
          </select>
          <button className="rounded-2xl bg-slate-900 px-5 font-bold text-white">Применить</button>
        </form>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <CatalogControls categories={categories} />
        <div>
          {result.products.length === 0 ? (
            <div className="grid min-h-[420px] place-items-center rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-card">
              <div>
                <div className="mx-auto mb-5 grid h-24 w-24 place-items-center rounded-3xl bg-slate-100 text-4xl">?</div>
                <h2 className="text-2xl font-extrabold text-slate-900">Ничего не найдено</h2>
                <p className="mt-2 text-slate-500">Измените параметры поиска.</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {result.products.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          )}

          <div className="mt-10 flex justify-center gap-2">
            {Array.from({ length: result.pages }).map((_, index) => {
              const page = index + 1;
              const params = new URLSearchParams(searchParams as Record<string, string>);
              params.set("page", String(page));
              return (
                <a key={page} href={`/catalog?${params.toString()}`} className={`grid h-11 w-11 place-items-center rounded-full text-sm font-bold ${result.page === page ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-600"}`}>
                  {page}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
