import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { getProduct, getProducts } from "@/lib/api";
import { money } from "@/lib/utils";
import { ProductCard } from "@/components/product-card";
import { ProductActions } from "@/components/product-actions";
import { ProductTabs } from "@/components/product-tabs";

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  if (!product) notFound();
  const recommendations = await getProducts({ category: product.category, limit: "4" });

  return (
    <div className="container-fluid py-10">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_460px]">
        <section>
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card">
            <Image src={product.image} alt={product.name} fill priority sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover" />
          </div>
          <div className="mt-4 grid grid-cols-4 gap-3">
            {[product.image, product.image, product.image, product.image].map((image, index) => (
              <div key={index} className="relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <Image src={image} alt={`${product.name} ${index + 1}`} fill sizes="140px" className="object-cover" />
              </div>
            ))}
          </div>
        </section>

        <aside className="lg:sticky lg:top-28 lg:h-fit">
          <div className="premium-card p-7">
            <div className="mb-4 flex items-center justify-between gap-4">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-950">{product.label}</span>
              <span className="inline-flex items-center gap-1 text-sm font-bold text-slate-950"><Star size={16} fill="currentColor" /> {product.rating} · {product.reviews} отзывов</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">{product.name}</h1>
            <p className="mt-3 leading-7 text-slate-500">{product.description}</p>
            <div className="mt-6 rounded-3xl bg-slate-50 p-5">
              <div className="text-sm font-semibold text-slate-400 line-through">{money(product.oldPrice || product.price)}</div>
              <div className="text-4xl font-extrabold text-slate-900">{money(product.price)}</div>
            </div>
            <div className="mt-6 grid gap-3">
              <div className="text-sm font-bold text-slate-700">Вариант</div>
              <div className="flex flex-wrap gap-2">
                {["Standard", "Extended", "Team"].map((item) => (
                  <button key={item} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition-colors first:border-slate-950 first:bg-slate-950 first:text-white hover:border-slate-950 hover:text-slate-950">{item}</button>
                ))}
              </div>
            </div>
            <ProductActions product={product} />
          </div>
        </aside>
      </div>

      <section className="mt-14">
        <ProductTabs product={product} />
      </section>

      <section className="mt-14">
        <div className="mb-7 flex items-center justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">С этим также покупают</h2>
          <Link href="/catalog" className="font-bold text-slate-950">В каталог</Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {recommendations.products.filter((item) => item.id !== product.id).map((item) => <ProductCard key={item.id} product={item} compact />)}
        </div>
      </section>
    </div>
  );
}
