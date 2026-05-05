"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth-store";

const schema = z.object({
  name: z.string().optional(),
  email: z.string().email("Введите корректную почту"),
  password: z.string().min(6, "Минимум 6 символов")
});

type FormValues = z.infer<typeof schema>;

export function AuthForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const { login, register, status, error } = useAuthStore();
  const { register: field, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur"
  });

  async function submit(values: FormValues) {
    if (mode === "login") await login(values.email, values.password);
    else await register(values.name || "Покупатель", values.email, values.password);
  }

  return (
    <div className="premium-card p-6">
      <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
        <button className={`rounded-xl px-4 py-3 text-sm font-bold ${mode === "login" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`} type="button" onClick={() => setMode("login")}>
          Вход
        </button>
        <button className={`rounded-xl px-4 py-3 text-sm font-bold ${mode === "register" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`} type="button" onClick={() => setMode("register")}>
          Регистрация
        </button>
      </div>

      <form className="grid gap-4" onSubmit={handleSubmit(submit)}>
        {mode === "register" && (
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Имя
            <Input {...field("name")} placeholder="Ваше имя" />
          </label>
        )}
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Email
          <Input {...field("email")} placeholder="name@example.com" />
          {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Пароль
          <Input type="password" {...field("password")} placeholder="******" />
          {errors.password && <span className="text-xs text-red-500">{errors.password.message}</span>}
        </label>
        {error && <div className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-500">{error}</div>}
        <Button size="lg" disabled={status === "loading"}>{mode === "login" ? "Войти" : "Создать аккаунт"}</Button>
      </form>
    </div>
  );
}
