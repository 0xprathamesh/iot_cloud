"use client";

import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "outline";

const variants: Record<Variant, string> = {
  primary:
    "bg-cyan-500/90 text-slate-950 hover:bg-cyan-400 focus-visible:outline-cyan-400 shadow-[0_0_24px_-4px_rgba(34,211,238,0.45)]",
  ghost: "text-slate-200 hover:bg-white/[0.06] focus-visible:outline-slate-400",
  outline:
    "border border-white/[0.12] text-slate-100 hover:bg-white/[0.04] focus-visible:outline-slate-400",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-45";
  return <button type="button" className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
