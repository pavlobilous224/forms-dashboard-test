"use client";

import type { Form } from "@/lib/types";
import { useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FormsFilters } from "@/app/components/forms/FormsFilters";
import { FormsTable } from "@/app/components/forms/FormsTable";
import { useToastStore } from "@/store/useToastStore";
import { formsToCsv } from "@/lib/csv";
import { useFormSelection } from "@/app/forms/useFormSelection";

interface FormsPageContentProps {
  forms: Form[];
}

export function FormsPageContent({ forms }: FormsPageContentProps) {
  const router = useRouter();
  const addToast = useToastStore((state) => state.addToast);
  const [isDeleting, startTransition] = useTransition();
  const { selectedIds, toggleSelection, selectAll, clearSelection } =
    useFormSelection();

  const handleExportSelected = useCallback(() => {
    const toExport = forms.filter((form) => selectedIds.has(form.id));
    if (toExport.length === 0) return;

    const csv = formsToCsv(toExport);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `forms-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [forms, selectedIds]);

  const handleDeleteSelected = useCallback(async () => {
    if (selectedIds.size === 0) return;
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedIds.size} selected form(s)?`,
    );
    if (!confirmed) return;

    const ids = Array.from(selectedIds);

    try {
      const responses = await Promise.all(
        ids.map((id) =>
          fetch(`/api/forms/${id}`, {
            method: "DELETE",
          }),
        ),
      );

      const failed = responses.filter(
        (res) => !res.ok && res.status !== 204,
      );

      if (failed.length > 0) {
        addToast({
          type: "error",
          message: "Some forms could not be deleted.",
        });
      } else {
        addToast({
          type: "success",
          message: `Deleted ${ids.length} form${ids.length === 1 ? "" : "s"}.`,
        });
      }

      clearSelection(ids);

      startTransition(() => {
        router.refresh();
      });
    } catch {
      addToast({
        type: "error",
        message: "Something went wrong. Please try again.",
      });
    }
  }, [addToast, clearSelection, router, selectedIds, startTransition]);

  return (
    <>
      <FormsFilters
        forms={forms}
        selectedIds={selectedIds}
        onExportSelected={handleExportSelected}
        onDeleteSelected={handleDeleteSelected}
        isDeleting={isDeleting}
      />
      <FormsTable
        forms={forms}
        selectedIds={selectedIds}
        onToggleSelection={toggleSelection}
        onSelectAll={selectAll}
      />
    </>
  );
}
