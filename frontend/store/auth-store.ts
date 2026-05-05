"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";

type AuthState = {
  token: string;
  user: User | null;
  status: "idle" | "loading" | "error";
  error: string;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  hydrateMe: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: "",
      user: null,
      status: "idle",
      error: "",
      async login(email, password) {
        set({ status: "loading", error: "" });
        try {
          const result = await api.login({ email, password });
          set({ token: result.token, user: result.user, status: "idle" });
        } catch (error) {
          set({ status: "error", error: error instanceof Error ? error.message : "Ошибка входа" });
        }
      },
      async register(name, email, password) {
        set({ status: "loading", error: "" });
        try {
          const result = await api.register({ name, email, password });
          set({ token: result.token, user: result.user, status: "idle" });
        } catch (error) {
          set({ status: "error", error: error instanceof Error ? error.message : "Ошибка регистрации" });
        }
      },
      logout() {
        set({ token: "", user: null, status: "idle", error: "" });
      },
      async hydrateMe() {
        const { token } = get();
        if (!token) return;
        try {
          const user = await api.me(token);
          set({ user });
        } catch {
          set({ token: "", user: null });
        }
      }
    }),
    { name: "marketplace-auth" }
  )
);
