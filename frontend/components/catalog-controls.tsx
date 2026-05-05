"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@/lib/types";

export function CatalogControls({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.set("page", "1");
    router.push(`/catalog?${params.toString()}`);
  }

  return (
    <aside className="premium-card h-fit p-6 lg:sticky lg:top-28">
      <h2 className="mb-5 text-xl font-extrabold text-slate-900">Фильтры</h2>
      <div className="grid gap-6">
        <div>
          <div className="mb-3 text-sm font-bold text-slate-700">Цена до</div>
          <input
            type="range"
            min="20"
            max="240"
            defaultValue={searchParams.get("maxPrice") || "240"}
            className="w-full accent-slate-950"
            onChange={(event) => setParam("maxPrice", event.target.value)}
          />
        </div>

        <div>
          <div className="mb-3 text-sm font-bold text-slate-700">Категории</div>
          <div className="grid gap-2">
            {categories.map((category) => (
              <label key={category.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600">
                <span>{category.label}</span>
                <input
                  type="checkbox"
                  checked={(searchParams.get("category") || "all") === category.id}
                  onChange={() => setParam("category", category.id)}
                  className="h-4 w-4 accent-slate-950"
                />
              </label>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3 text-sm font-bold text-slate-700">Рейтинг</div>
          <div className="flex gap-2">
            {["4", "4.5", "4.8"].map((value) => (
              <button key={value} type="button" className="rounded-full border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 hover:border-slate-950 hover:text-slate-950" onClick={() => setParam("rating", value)}>
                {value}+
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
