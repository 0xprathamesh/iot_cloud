import type { ReactNode } from "react";

const tones: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/25",
  disabled: "bg-slate-500/15 text-slate-400 ring-slate-400/20",
  default: "bg-white/[0.06] text-slate-300 ring-white/10",
};

export function Badge({
  children,
  tone = "default",
  className = "",
}: {
  children: ReactNode;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
