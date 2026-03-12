"use client";

import Link from "next/link";
import type { Form } from "@/lib/types";
import { formStatusValues } from "@/lib/types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { LabeledSelect } from "@/app/components/ui/LabeledSelect";

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  ...formStatusValues.map((status) => ({
    value: status,
    label: status.charAt(0).toUpperCase() + status.slice(1),
  })),
] as const;

interface FormsFiltersProps {
  forms: Form[];
  selectedIds: Set<string>;
  onExportSelected: () => void;
  onDeleteSelected: () => void;
  isDeleting: boolean;
}

export function FormsFilters({
  forms,
  selectedIds,
  onExportSelected,
  onDeleteSelected,
  isDeleting,
}: FormsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const role = useAuthStore((state) => state.role);

  const current = searchParams.get("status") ?? "all";

  function setStatus(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("status");
    } else {
      params.set("status", value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  const selectedCount = useMemo(
    () => forms.filter((form) => selectedIds.has(form.id)).length,
    [forms, selectedIds],
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <LabeledSelect
        id="status-filter"
        label="Status"
        value={current}
        options={STATUS_OPTIONS}
        onChange={setStatus}
      />

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onExportSelected}
          disabled={selectedCount === 0}
          className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
        >
          {selectedCount > 0
            ? `Export CSV (${selectedCount})`
            : "Export CSV"}
        </button>
        {role === "admin" && (
          <button
            type="button"
            onClick={onDeleteSelected}
            disabled={selectedCount === 0 || isDeleting}
            className="inline-flex items-center justify-center rounded-lg border border-red-300 bg-red-600/10 px-4 py-2 text-sm font-medium text-red-700 shadow-sm transition hover:bg-red-600/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-800 dark:bg-red-900/30 dark:text-red-100 dark:hover:bg-red-900/50"
          >
            {isDeleting
              ? "Deleting..."
              : selectedCount > 0
                ? `Delete selected (${selectedCount})`
                : "Delete selected"}
          </button>
        )}
        {role === "admin" && (
          <Link
            href="/forms/new"
            className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 shadow-sm transition hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            New form
          </Link>
        )}
      </div>
    </div>
  );
}

