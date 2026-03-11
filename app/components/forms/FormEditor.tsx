"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema, type FormInput } from "@/lib/schemas";
import { formStatusValues, type FormStatus } from "@/lib/types";
import { useToastStore } from "@/store/useToastStore";
import { LabeledSelect } from "@/app/components/ui/LabeledSelect";

const STATUS_OPTIONS: { value: FormStatus; label: string }[] =
  formStatusValues.map((status) => ({
    value: status,
    label: status.charAt(0).toUpperCase() + status.slice(1),
  }));

interface FormEditorProps {
  mode: "create" | "edit";
  initialValues?: FormInput;
  formId?: string;
}

export function FormEditor({ mode, initialValues, formId }: FormEditorProps) {
  const router = useRouter();
  const addToast = useToastStore((state) => state.addToast);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues ?? {
      title: "",
      description: "",
      fieldsCount: 0,
      status: "draft",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const endpoint =
      mode === "create" ? "/api/forms" : `/api/forms/${formId as string}`;
    const method = mode === "create" ? "POST" : "PUT";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        addToast({
          type: "error",
          message: "Failed to save form. Please check your input.",
        });
        return;
      }

      addToast({
        type: "success",
        message: mode === "create" ? "Form created" : "Form updated",
      });
      router.push("/forms");
    } catch {
      addToast({
        type: "error",
        message: "Something went wrong. Please try again.",
      });
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full max-w-xl flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      noValidate
    >
      <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        {mode === "create" ? "Create form" : "Edit form"}
      </h1>

      <div className="space-y-1">
        <label
          htmlFor="title"
          className="text-sm font-medium text-zinc-800 dark:text-zinc-100"
        >
          Title
        </label>
        <input
          id="title"
          type="text"
          className="block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? "title-error" : undefined}
          {...register("title")}
        />
        {errors.title && (
          <p id="title-error" className="text-xs text-red-500">
            {errors.title.message}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label
          htmlFor="description"
          className="text-sm font-medium text-zinc-800 dark:text-zinc-100"
        >
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          className="block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? "description-error" : undefined}
          {...register("description")}
        />
        {errors.description && (
          <p id="description-error" className="text-xs text-red-500">
            {errors.description.message as string}
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label
            htmlFor="fieldsCount"
            className="text-sm font-medium text-zinc-800 dark:text-zinc-100"
          >
            Fields count
          </label>
          <input
            id="fieldsCount"
            type="number"
            min={0}
            max={50}
            className="block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            aria-invalid={!!errors.fieldsCount}
            aria-describedby={
              errors.fieldsCount ? "fieldsCount-error" : undefined
            }
            {...register("fieldsCount", {
              valueAsNumber: true,
            })}
          />
          {errors.fieldsCount && (
            <p id="fieldsCount-error" className="text-xs text-red-500">
              {errors.fieldsCount.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <LabeledSelect
            id="status"
            label="Status"
            value={watch("status")}
            options={STATUS_OPTIONS}
            onChange={(value) => setValue("status", value as FormStatus)}
            layout="vertical"
          />
          {errors.status && (
            <p id="status-error" className="text-xs text-red-500">
              {errors.status.message as string}
            </p>
          )}
        </div>
      </div>

      <div className="mt-2 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/forms")}
          className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          {isSubmitting ? "Saving..." : "Save form"}
        </button>
      </div>
    </form>
  );
}

