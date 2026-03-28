"use client";

import useSWR from "swr";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ApiError, getDeviceMe, listTelemetry, updateDeviceMe } from "@/lib/api";
import { useApiKey } from "@/hooks/use-api-key";
import { rangeFromPreset, type RangePreset } from "@/lib/range";
import type { DeviceOut } from "@/lib/types";
import { DeviceStatusBadge } from "@/components/device/device-status-badge";
import { TelemetryChart } from "@/components/telemetry/telemetry-chart";
import { TelemetryTable } from "@/components/telemetry/telemetry-table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { OffsetPaginationBar } from "@/components/ui/pagination-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { LinkButton } from "@/components/ui/link-button";

const TELEMETRY_PAGE_SIZE = 50;

const presets: { id: RangePreset; label: string }[] = [
  { id: "24h", label: "24h" },
  { id: "7d", label: "7d" },
  { id: "30d", label: "30d" },
  { id: "all", label: "All" },
];

function ExtraChips({ extra }: { extra: Record<string, unknown> | null }) {
  if (!extra) return null;
  const entries = Object.entries(extra).filter(([k]) => !k.startsWith("_"));
  if (!entries.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {entries.map(([k, v]) => (
        <span
          key={k}
          className="rounded-lg bg-white/[0.05] px-2.5 py-1 text-xs text-slate-300 ring-1 ring-white/[0.06]"
        >
          <span className="text-slate-500">{k}</span>{" "}
          <span className="font-mono text-slate-200">{String(v)}</span>
        </span>
      ))}
    </div>
  );
}

function ProfileEditor({
  device,
  token,
  onSaved,
  onClose,
}: {
  device: DeviceOut;
  token: string;
  onSaved: (d: DeviceOut) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(device.name);
  const [description, setDescription] = useState(device.description ?? "");
  const [extraRaw, setExtraRaw] = useState(
    device.device_extra ? JSON.stringify(device.device_extra, null, 2) : "",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      let device_extra: Record<string, unknown> | null | undefined;
      if (extraRaw.trim()) {
        device_extra = JSON.parse(extraRaw) as Record<string, unknown>;
      } else {
        device_extra = null;
      }
      const next = await updateDeviceMe(token, {
        name: name.trim(),
        description: description.trim() || null,
        device_extra,
      });
      onSaved(next);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="p-5">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-400">Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-400">Description</label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-400">device_extra JSON</label>
          <Textarea
            value={extraRaw}
            onChange={(e) => setExtraRaw(e.target.value)}
            rows={6}
            className="font-mono text-xs"
            spellCheck={false}
          />
        </div>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save"}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default function DashboardPage() {
  const { key, clear, hydrated } = useApiKey();
  const [preset, setPreset] = useState<RangePreset>("7d");
  const [editOpen, setEditOpen] = useState(false);
  const [telemetryPage, setTelemetryPage] = useState(0);

  useEffect(() => {
    setTelemetryPage(0);
  }, [preset, key]);

  const meFetcher = async ([, t]: readonly [string, string]) => getDeviceMe(t);
  const {
    data: device,
    error: meErr,
    isLoading: meLoading,
    mutate: mutMe,
  } = useSWR(key ? (["me", key] as const) : null, meFetcher, { revalidateOnFocus: false });

  const telFetcher = async ([, t, pr, pg, ps]: readonly [
    string,
    string,
    RangePreset,
    number,
    number,
  ]) => {
    const r = rangeFromPreset(pr);
    const offset = pg * ps;
    const raw = await listTelemetry(t, {
      limit: ps + 1,
      offset,
      newest_first: false,
      ...r,
    });
    const hasNext = raw.length > ps;
    return { points: raw.slice(0, ps), hasNext };
  };

  const { data: telPage, isLoading: telLoading } = useSWR(
    key ? (["tel", key, preset, telemetryPage, TELEMETRY_PAGE_SIZE] as const) : null,
    telFetcher,
    { keepPreviousData: true },
  );

  const points = useMemo(() => telPage?.points ?? [], [telPage]);
  const hasNext = telPage?.hasNext ?? false;

  const sortedForChart = useMemo(
    () => [...points].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
    [points],
  );

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!key) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-slate-300">No API key in this browser.</p>
        <div className="mt-4 flex justify-center gap-2">
          <LinkButton href="/connect">Connect key</LinkButton>
          <LinkButton href="/register" variant="outline">
            Register
          </LinkButton>
        </div>
      </Card>
    );
  }

  const authLost =
    meErr instanceof ApiError && (meErr.status === 401 || meErr.status === 403);

  if (authLost) {
    return (
      <Card className="space-y-3 p-8 text-center">
        <p className="text-sm text-slate-300">This key is no longer valid or the device is disabled.</p>
        <div className="flex justify-center gap-2">
          <Button
            type="button"
            onClick={() => {
              clear();
              window.location.href = "/connect";
            }}
          >
            Clear & reconnect
          </Button>
        </div>
      </Card>
    );
  }

  if (meLoading && !device) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-8 w-full max-w-md" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (meErr || !device) {
    return (
      <Card className="p-6 text-sm text-red-200">
        {(meErr as Error)?.message ?? "Unable to load device"}
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-2xl font-semibold tracking-tight text-white">
              {device.name}
            </h1>
            <DeviceStatusBadge status={device.status} />
          </div>
          <p className="text-xs font-mono text-slate-500">{device.id}</p>
          {device.description ? (
            <p className="max-w-2xl text-sm text-slate-400">{device.description}</p>
          ) : null}
          <p className="text-xs text-slate-500">
            Key hint <span className="font-mono text-slate-300">{device.api_key_hint}</span>
          </p>
          <ExtraChips extra={device.device_extra} />
        </div>
        <div className="flex flex-shrink-0 flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => setEditOpen((v) => !v)}>
            {editOpen ? "Close editor" : "Edit profile"}
          </Button>
  
          <Link href="/devices" className="inline-flex items-center text-sm text-slate-400 hover:text-white">
            Device list →
          </Link>
        </div>
      </div>

      {editOpen ? (
        <ProfileEditor
          device={device}
          token={key}
          onSaved={(d) => mutMe(d, { revalidate: false })}
          onClose={() => setEditOpen(false)}
        />
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {presets.map((p) => (
          <Button
            key={p.id}
            type="button"
            variant={preset === p.id ? "primary" : "outline"}
            className="min-w-[3.5rem] px-3 py-2 text-xs"
            onClick={() => setPreset(p.id)}
          >
            {p.label}
          </Button>
        ))}
        <span className="ml-auto text-xs text-slate-500">
          {telLoading ? "Refreshing…" : `${points.length} points this page`}
        </span>
      </div>

      <OffsetPaginationBar
        page={telemetryPage}
        pageSize={TELEMETRY_PAGE_SIZE}
        hasNext={hasNext}
        onPageChange={setTelemetryPage}
      />

      <TelemetryChart points={sortedForChart} />
      <TelemetryTable points={points} />

      <OffsetPaginationBar
        page={telemetryPage}
        pageSize={TELEMETRY_PAGE_SIZE}
        hasNext={hasNext}
        onPageChange={setTelemetryPage}
      />
    </div>
  );
}
