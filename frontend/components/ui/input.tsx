"use client";

import type { InputHTMLAttributes } from "react";

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-xl border border-white/[0.10] bg-white/[0.04] px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-[box-shadow,border-color] focus-visible:border-cyan-400/50 focus-visible:ring-2 focus-visible:ring-cyan-400/20 ${className}`}
      {...props}
    />
  );
}
