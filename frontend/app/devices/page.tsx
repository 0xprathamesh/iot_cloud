"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { listDevices } from "@/lib/api";
import { DeviceConnectModal } from "@/components/device/device-connect-modal";
import { DeviceGrid, DeviceGridSkeleton } from "@/components/device/device-grid";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { Card } from "@/components/ui/card";
import type { DeviceSummary } from "@/lib/types";

const PAGE_SIZE = 9;

export default function DevicesPage() {
  const [page, setPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [active, setActive] = useState<DeviceSummary | null>(null);

  const skip = page * PAGE_SIZE;
  const swrKey = useMemo(() => ["devices", skip, PAGE_SIZE] as const, [skip]);

  const { data, error, isLoading } = useSWR(
    swrKey,
    ([, s, lim]) => listDevices({ skip: s, limit: lim }),
    { revalidateOnFocus: true, dedupingInterval: 5_000, keepPreviousData: true },
  );

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  useEffect(() => {
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const max = pages - 1;
    if (total > 0 && page > max) setPage(max);
  }, [total, page]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Devices</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            Directory for local development. Select a card to verify an API key for that device.
          </p>
        </div>
        <p className="text-xs text-slate-500">
          <span className="font-mono text-slate-400">{total}</span> total
        </p>
      </div>

      {error ? (
        <Card className="border-red-500/25 bg-red-500/5 p-5 text-sm text-red-200">
          {(error as Error).message}
        </Card>
      ) : null}

      {!isLoading && total > 0 ? (
        <PaginationBar page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
      ) : null}

      {isLoading && !data ? (
        <DeviceGridSkeleton count={PAGE_SIZE} />
      ) : (
        <DeviceGrid
          devices={items}
          selectedId={active?.id}
          onSelect={(d) => {
            setActive(d);
            setModalOpen(true);
          }}
        />
      )}

      <DeviceConnectModal
        open={modalOpen}
        device={active}
        onClose={() => {
          setModalOpen(false);
          setActive(null);
        }}
      />
    </div>
  );
}
