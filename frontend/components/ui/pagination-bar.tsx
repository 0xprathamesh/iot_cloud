"use client";

import { Button } from "@/components/ui/button";

export function PaginationBar({
  page,
  pageSize,
  total,
  onPageChange,
  compact,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (next: number) => void;
  compact?: boolean;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(0, page), totalPages - 1);
  const from = total === 0 ? 0 : safePage * pageSize + 1;
  const to = Math.min(total, (safePage + 1) * pageSize);

  return (
    <div
      className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${compact ? "" : "rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"}`}
    >
      <p className="text-xs text-slate-500">
        {total === 0 ? (
          "No rows"
        ) : (
          <>
            <span className="text-slate-300">
              {from}–{to}
            </span>
            <span className="text-slate-600"> of </span>
            <span className="text-slate-300">{total}</span>
          </>
        )}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className="min-w-[4rem] px-3 py-2 text-xs"
          disabled={safePage <= 0}
          onClick={() => onPageChange(0)}
        >
          First
        </Button>
        <Button
          type="button"
          variant="outline"
          className="min-w-[4rem] px-3 py-2 text-xs"
          disabled={safePage <= 0}
          onClick={() => onPageChange(safePage - 1)}
        >
          Prev
        </Button>
        <span className="px-2 text-xs tabular-nums text-slate-400">
          Page {total === 0 ? 0 : safePage + 1} / {total === 0 ? 0 : totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          className="min-w-[4rem] px-3 py-2 text-xs"
          disabled={safePage >= totalPages - 1 || total === 0}
          onClick={() => onPageChange(safePage + 1)}
        >
          Next
        </Button>
        <Button
          type="button"
          variant="outline"
          className="min-w-[4rem] px-3 py-2 text-xs"
          disabled={safePage >= totalPages - 1 || total === 0}
          onClick={() => onPageChange(totalPages - 1)}
        >
          Last
        </Button>
      </div>
    </div>
  );
}

export function OffsetPaginationBar({
  page,
  pageSize,
  hasNext,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  hasNext: boolean;
  onPageChange: (next: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-slate-500">
        Page <span className="text-slate-300">{page + 1}</span>
        <span className="text-slate-600"> · </span>
        <span className="text-slate-400">{pageSize} rows per page</span>
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className="min-w-[4rem] px-3 py-2 text-xs"
          disabled={page <= 0}
          onClick={() => onPageChange(page - 1)}
        >
          Prev
        </Button>
        <Button
          type="button"
          variant="outline"
          className="min-w-[4rem] px-3 py-2 text-xs"
          disabled={!hasNext}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
