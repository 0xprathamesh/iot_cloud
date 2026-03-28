"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "ghost" | "outline";

const variants: Record<Variant, string> = {
  primary:
    "bg-cyan-500/90 text-slate-950 hover:bg-cyan-400 shadow-[0_0_24px_-4px_rgba(34,211,238,0.45)]",
  ghost: "text-slate-200 hover:bg-white/[0.06]",
  outline: "border border-white/[0.12] text-slate-100 hover:bg-white/[0.04]",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-blue-300";

export function LinkButton({
  href,
  variant = "primary",
  className = "",
  ...props
}: { href: string; variant?: Variant; className?: string } & Omit<
  ComponentProps<typeof Link>,
  "href" | "className"
> & { className?: string }) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`} {...props} />
  );
}
