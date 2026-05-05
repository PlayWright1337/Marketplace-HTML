import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "default" | "lg" | "icon";
};

export function Button({ className, variant = "primary", size = "default", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-slate-950/10",
        variant === "primary" && "primary-gradient",
        variant === "secondary" && "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
        variant === "ghost" && "text-slate-700 hover:bg-slate-100",
        size === "default" && "h-11 px-5 text-sm",
        size === "lg" && "h-14 px-8 text-base",
        size === "icon" && "h-11 w-11 px-0",
        className
      )}
      {...props}
    />
  );
}
