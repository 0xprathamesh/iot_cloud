import type { HTMLAttributes } from "react";

export function Card({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.08] bg-[var(--surface)]/90 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.85)] backdrop-blur-xl ${className}`}
      {...props}
    />
  );
}
