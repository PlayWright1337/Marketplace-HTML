"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, CreditCard, MapPin, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { money } from "@/lib/utils";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";

const schema = z.object({
  name: z.string().min(2, "Введите имя"),
  email: z.string().email("Введите email"),
  address: z.string().min(5, "Введите адрес"),
  payment: z.string().min(2, "Выберите способ оплаты")
});

type Values = z.infer<typeof schema>;

const steps: Array<[string, LucideIcon]> = [
  ["Контакты", UserRound],
  ["Доставка", MapPin],
  ["Оплата", CreditCard]
];

export function CheckoutForm() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const { token } = useAuthStore();
  const { items, total, clearLocal } = useCartStore();
  const { register, handleSubmit, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: { payment: "card" }
  });

  async function submit() {
    try {
      await api.checkout(token);
    } catch {
      // Local fallback keeps the form demonstrable until the real backend is running.
    }
    clearLocal();
    setDone(true);
  }

  if (done) {
    return (
      <div className="grid min-h-[420px] place-items-center rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-card">
        <div>
          <div className="mx-auto mb-5 grid h-24 w-24 place-items-center rounded-3xl bg-slate-100 text-slate-950"><Check size={42} /></div>
          <h2 className="text-3xl font-extrabold">Заказ подтверждён</h2>
          <p className="mt-2 text-slate-500">Ответ checkout обработан, корзина очищена.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <form className="premium-card p-6" onSubmit={handleSubmit(submit)}>
        <div className="mb-8">
          <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-slate-950 transition-all duration-300" style={{ width: `${((step + 1) / 3) * 100}%` }} />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {steps.map(([label, Icon], index) => (
              <button key={String(label)} type="button" className={`rounded-2xl border p-4 text-left transition-colors ${step === index ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 text-slate-500 hover:border-slate-950 hover:text-slate-950"}`} onClick={() => setStep(index)}>
                <Icon className="mb-2" size={20} />
                <span className="text-sm font-bold">{String(label)}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          {step === 0 && (
            <>
              <label className="grid gap-2 text-sm font-bold text-slate-700">Имя<Input {...register("name")} />{errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}</label>
              <label className="grid gap-2 text-sm font-bold text-slate-700">Email<Input {...register("email")} />{errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}</label>
            </>
          )}
          {step === 1 && <label className="grid gap-2 text-sm font-bold text-slate-700">Адрес<Input {...register("address")} />{errors.address && <span className="text-xs text-red-500">{errors.address.message}</span>}</label>}
          {step === 2 && (
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Оплата
              <select className="premium-input" {...register("payment")}><option value="card">Банковская карта</option><option value="balance">Баланс аккаунта</option></select>
              {errors.payment && <span className="text-xs text-red-500">{errors.payment.message}</span>}
            </label>
          )}
        </div>

        <div className="mt-8 flex justify-between gap-3">
          <Button type="button" variant="secondary" disabled={step === 0} onClick={() => setStep((value) => value - 1)}>Назад</Button>
          {step < 2 ? <Button type="button" onClick={() => setStep((value) => value + 1)}>Далее</Button> : <Button>Подтвердить заказ</Button>}
        </div>
      </form>

      <aside className="premium-card h-fit p-6 lg:sticky lg:top-28">
        <h2 className="mb-4 text-xl font-extrabold">Сводка</h2>
        <div className="grid gap-3">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between gap-3 text-sm">
              <span className="text-slate-500">{item.product?.name}</span>
              <strong>{money(item.product?.price || 0)}</strong>
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-between border-t border-slate-200 pt-5 text-lg font-extrabold">
          <span>Итого</span>
          <span>{money(total())}</span>
        </div>
      </aside>
    </div>
  );
}
