import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { CartDrawer } from "@/components/cart-drawer";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Marketplace",
  description: "Premium Fluid marketplace frontend with API-ready architecture"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={`${inter.variable} font-sans`}>
        <Suspense fallback={<div className="h-20 border-b border-slate-200 bg-white/80" />}>
          <SiteHeader />
        </Suspense>
        <main className="animate-fade-up">{children}</main>
        <CartDrawer />
      </body>
    </html>
  );
}
