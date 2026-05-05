import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CartPage() {
  return (
    <div className="container-fluid grid min-h-[55vh] place-items-center py-16 text-center">
      <div className="max-w-xl">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Корзина открывается шторкой</h1>
        <p className="mt-4 leading-7 text-slate-500">Состояние корзины централизовано в Zustand и синхронизируется с `/api/cart`.</p>
        <Link href="/checkout" className="mt-7 inline-flex"><Button size="lg">Перейти к оформлению</Button></Link>
      </div>
    </div>
  );
}
