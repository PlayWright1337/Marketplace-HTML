import { CheckoutForm } from "@/components/checkout-form";

export default function CheckoutPage() {
  return (
    <div className="container-fluid py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 lg:text-5xl">Оформление заказа</h1>
        <p className="mt-3 text-slate-500">Форма валидируется через Zod и React Hook Form, а подтверждение уходит в `/api/checkout`.</p>
      </div>
      <CheckoutForm />
    </div>
  );
}
