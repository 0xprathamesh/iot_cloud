"use client";

import { memo, useMemo } from "react";
import type { TelemetryPoint } from "@/lib/types";
import { Card } from "@/components/ui/card";

export const TelemetryTable = memo(function TelemetryTable({
  points,
}: {
  points: TelemetryPoint[];
}) {
  const rows = useMemo(
    () =>
      [...points].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      ),
    [points],
  );

  if (!rows.length) return null;

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-white/[0.06] px-4 py-3">
        <p className="text-sm font-medium text-white">Recent readings</p>
        <p className="text-xs text-slate-500">Newest first</p>
      </div>
      <div className="max-h-[420px] overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-[var(--surface)]/95 backdrop-blur-sm">
            <tr className="text-xs text-slate-500">
              <th className="px-4 py-2 font-medium">Time</th>
              <th className="px-4 py-2 font-medium">°C</th>
              <th className="px-4 py-2 font-medium">%</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                className="border-t border-white/[0.04] text-slate-300 hover:bg-white/[0.03]"
              >
                <td className="whitespace-nowrap px-4 py-2 text-xs text-slate-400">
                  {new Intl.DateTimeFormat(undefined, {
                    dateStyle: "short",
                    timeStyle: "medium",
                  }).format(new Date(r.timestamp))}
                </td>
                <td className="px-4 py-2 font-mono text-cyan-300/90">{r.data.temperature}</td>
                <td className="px-4 py-2 font-mono text-indigo-300/90">{r.data.humidity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
});
