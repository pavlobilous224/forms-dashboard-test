"use client";

import type { Form } from "@/lib/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useTransition, useRef, useEffect } from "react";
import { useToastStore } from "@/store/useToastStore";
import { useAuthStore } from "@/store/useAuthStore";

interface FormsTableProps {
  forms: Form[];
  selectedIds: Set<string>;
  onToggleSelection: (id: string) => void;
  onSelectAll: (ids: string[], checked: boolean) => void;
}

export function FormsTable({
  forms,
  selectedIds,
  onToggleSelection,
  onSelectAll,
}: FormsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const addToast = useToastStore((state) => state.addToast);
  const [isPending, startTransition] = useTransition();
  const role = useAuthStore((state) => state.role);

  const statusFilter = searchParams.get("status") ?? "all";
  const selectAllRef = useRef<HTMLInputElement>(null);

  // TODO: consider moving this filtering to the server once there are many forms
  const filtered = useMemo(() => {
    if (statusFilter === "all") return forms;
    return forms.filter((form) => form.status === statusFilter);
  }, [forms, statusFilter]);

  useEffect(() => {
    const el = selectAllRef.current;
    if (!el) return;
    const some = filtered.some((f) => selectedIds.has(f.id));
    const all =
      filtered.length > 0 && filtered.every((f) => selectedIds.has(f.id));
    el.indeterminate = some && !all;
  }, [filtered, selectedIds]);

  // TODO: show a nicer confirmation dialog instead of window.confirm
  async function handleDelete(id: string) {
    const confirmed = window.confirm("Are you sure you want to delete this form?");
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/forms/${id}`, {
        method: "DELETE",
      });

      if (!response.ok && response.status !== 204) {
        addToast({
          type: "error",
          message: "Failed to delete form.",
        });
        return;
      }

      addToast({
        type: "success",
        message: "Form deleted",
      });

      startTransition(() => {
        router.refresh();
      });
    } catch {
      addToast({
        type: "error",
        message: "Oops, couldn't delete this form. Try again in a bit.",
      });
    }
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
          <thead className="bg-zinc-50 dark:bg-zinc-950/40">
            <tr>
              <th className="w-10 px-4 py-3">
                <label className="sr-only">Select all</label>
                <input
                  type="checkbox"
                  ref={selectAllRef}
                  checked={
                    filtered.length > 0 &&
                    filtered.every((f) => selectedIds.has(f.id))
                  }
                  onChange={() => {
                    const allSelected = filtered.every((f) =>
                      selectedIds.has(f.id),
                    );
                    onSelectAll(
                      filtered.map((f) => f.id),
                      !allSelected,
                    );
                  }}
                  disabled={filtered.length === 0}
                  className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 dark:border-zinc-600 dark:bg-zinc-800"
                />
              </th>
              <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">
                Title
              </th>
              <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">
                Status
              </th>
              <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">
                Fields
              </th>
              <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">
                Updated
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
            {filtered.map((form) => (
              <tr key={form.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                <td className="whitespace-nowrap px-4 py-3">
                  <label className="sr-only">Select {form.title}</label>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(form.id)}
                    onChange={() => onToggleSelection(form.id)}
                    className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 dark:border-zinc-600 dark:bg-zinc-800"
                  />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-zinc-900 dark:text-zinc-50">
                  {form.title}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      form.status === "active"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                        : form.status === "draft"
                          ? "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-100"
                    }`}
                  >
                    {form.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-zinc-700 dark:text-zinc-300">
                  {form.fieldsCount}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-zinc-700 dark:text-zinc-300">
                  {new Date(form.updatedAt).toISOString().slice(0, 10)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  {role === "admin" && (
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => router.push(`/forms/${form.id}`)}
                        className="inline-flex items-center rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleDelete(form.id)}
                        className="inline-flex items-center rounded-full border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-800 dark:text-red-200 dark:hover:bg-red-950/40"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400"
                >
                  No forms found for the selected filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

