"use client";

import { memo, useMemo } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TelemetryPoint } from "@/lib/types";
import { Card } from "@/components/ui/card";

export type ChartRow = {
  t: string;
  temperature: number;
  humidity: number;
  raw: string;
};

function toRows(points: TelemetryPoint[]): ChartRow[] {
  return points.map((p) => {
    const ts = new Date(p.timestamp).getTime();
    return {
      t: String(ts),
      temperature: p.data.temperature,
      humidity: p.data.humidity,
      raw: p.timestamp,
    };
  });
}

function tickFormatter(ts: string) {
  const n = Number(ts);
  if (Number.isNaN(n)) return ts;
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(n));
}

const ChartBody = memo(function ChartBody({ points }: { points: TelemetryPoint[] }) {
  const data = useMemo(() => toRows(points), [points]);

  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={320}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis
          dataKey="t"
          tickFormatter={tickFormatter}
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          minTickGap={24}
        />
        <YAxis
          yAxisId="temp"
          tick={{ fill: "#67e8f9", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={40}
          domain={["auto", "auto"]}
        />
        <YAxis
          yAxisId="hum"
          orientation="right"
          tick={{ fill: "#a5b4fc", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={40}
          domain={["auto", "auto"]}
        />
        <Tooltip
          contentStyle={{
            background: "rgba(15,17,26,0.94)",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 12,
            fontSize: 12,
          }}
          labelFormatter={(ts) => tickFormatter(String(ts))}
          formatter={(value, name) => [value, name === "temperature" ? "°C" : "%"]}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line
          yAxisId="temp"
          type="monotone"
          dataKey="temperature"
          name="temperature"
          stroke="#22d3ee"
          strokeWidth={2}
          dot={false}
          isAnimationActive={points.length < 400}
          activeDot={{ r: 4 }}
        />
        <Line
          yAxisId="hum"
          type="monotone"
          dataKey="humidity"
          name="humidity"
          stroke="#818cf8"
          strokeWidth={2}
          dot={false}
          isAnimationActive={points.length < 400}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
});

export const TelemetryChart = memo(function TelemetryChart({
  points,
}: {
  points: TelemetryPoint[];
}) {
  if (!points.length) {
    return (
      <Card className="flex min-h-[360px] items-center justify-center p-8 text-sm text-slate-500">
        No telemetry in this range.
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-5">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white">Time series</p>
          <p className="text-xs text-slate-500">{points.length} points</p>
        </div>
      </div>
      <div className="h-[min(420px,56vh)] w-full">
        <ChartBody points={points} />
      </div>
    </Card>
  );
});
