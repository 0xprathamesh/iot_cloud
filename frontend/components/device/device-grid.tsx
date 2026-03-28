"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DeviceSummary } from "@/lib/types";
import { DeviceStatusBadge } from "@/components/device/device-status-badge";

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function DeviceGridSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-5">
          <Skeleton className="mb-3 h-5 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
        </Card>
      ))}
    </div>
  );
}

export function DeviceGrid({
  devices,
  selectedId,
  onSelect,
}: {
  devices: DeviceSummary[];
  selectedId?: string | null;
  onSelect?: (d: DeviceSummary) => void;
}) {
  if (!devices.length) {
    return (
      <Card className="p-10 text-center text-sm text-slate-400">
        No devices yet. Register one to get started.
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {devices.map((d) => {
        const active = selectedId === d.id;
        const interactive = Boolean(onSelect);
        return (
          <Card
            key={d.id}
            role={interactive ? "button" : undefined}
            tabIndex={interactive ? 0 : undefined}
            onClick={interactive ? () => onSelect?.(d) : undefined}
            onKeyDown={
              interactive
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelect?.(d);
                    }
                  }
                : undefined
            }
            className={`p-5 transition-all ${
              interactive
                ? `cursor-pointer hover:-translate-y-0.5 hover:border-white/[0.14] hover:bg-white/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400/40 ${
                    active ? "border-cyan-400/35 bg-cyan-400/[0.06] ring-1 ring-cyan-400/25" : ""
                  }`
                : ""
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium tracking-tight text-white">{d.name}</p>
                <p className="mt-0.5 truncate text-xs text-slate-500">{d.id}</p>
              </div>
              <DeviceStatusBadge status={d.status} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400">
              <span className="rounded-md bg-white/[0.05] px-2 py-1">{d.auth_kind}</span>
              <span className="rounded-md bg-white/[0.05] px-2 py-1">{formatDate(d.created_at)}</span>
            </div>
            {interactive ? (
              <p className="mt-4 text-xs text-cyan-300/80">Click to connect · API key required</p>
            ) : null}
          </Card>
        );
      })}
    </div>
  );
}
