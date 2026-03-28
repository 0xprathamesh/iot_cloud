"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/devices", label: "Devices" },
  { href: "/dashboard", label: "Dashboard" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="relative min-h-full overflow-x-hidden bg-[var(--bg)] text-slate-100">
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_90%_55%_at_50%_-18%,rgba(34,211,238,0.14),transparent_58%),radial-gradient(ellipse_60%_45%_at_100%_0%,rgba(99,102,241,0.10),transparent_50%)]"
        aria-hidden
      />
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[var(--bg)]/75 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
            <span>Ingestify</span>
          </Link>
          <nav className="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
                    active
                      ? " text-cyan-400"
                      : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-200"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}
