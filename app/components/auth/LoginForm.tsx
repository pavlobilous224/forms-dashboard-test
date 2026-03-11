"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/schemas";
import { roleValues, type Role } from "@/lib/types";
import { useToastStore } from "@/store/useToastStore";
import { useAuthStore } from "@/store/useAuthStore";
import { LabeledSelect } from "@/app/components/ui/LabeledSelect";

const ROLE_OPTIONS: ReadonlyArray<{ value: Role; label: string }> =
  roleValues.map((role) => ({
    value: role,
    label: role === "admin" ? "Admin" : "Individual",
  }));

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/forms";
  const addToast = useToastStore((state) => state.addToast);
  const setUser = useAuthStore((state) => state.setUser);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      role: "individual",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        addToast({
          type: "error",
          message: "Login failed. Please check your input.",
        });
        return;
      }

      setUser({ email: values.email, role: values.role });
      addToast({
        type: "success",
        message: "Logged in successfully",
      });
      router.push(from);
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
      className="mx-auto flex w-full max-w-md flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      noValidate
    >
      <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Login
      </h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Use any email and choose a role to start. Admin role can create and
        edit forms.
      </p>

      <div className="space-y-1">
        <label
          htmlFor="email"
          className="text-sm font-medium text-zinc-800 dark:text-zinc-100"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          className="block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          {...register("email")}
        />
        {errors.email && (
          <p
            id="email-error"
            className="text-xs text-red-500"
          >
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <LabeledSelect
          id="role"
          label="Role"
          value={watch("role")}
          options={ROLE_OPTIONS}
          onChange={(value) => setValue("role", value as Role)}
          className="flex-col items-stretch gap-1 sm:flex-row sm:items-center"
        />
        {errors.role && (
          <p id="role-error" className="text-xs text-red-500">
            {errors.role.message as string}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
      >
        {isSubmitting ? "Signing in..." : "Continue"}
      </button>
    </form>
  );
}

