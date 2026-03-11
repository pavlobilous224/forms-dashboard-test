"use client";

import { useRouter } from "next/navigation";
import { useToastStore } from "@/store/useToastStore";
import { useAuthStore } from "@/store/useAuthStore";

export function UserMenu() {
  const router = useRouter();
  const addToast = useToastStore((state) => state.addToast);
  const { email, role, isLoggedIn, clearUser } = useAuthStore();

  if (!isLoggedIn) {
    return null;
  }

  async function handleLogout() {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
      });

      if (!response.ok) {
        addToast({
          type: "error",
          message: "Failed to log out.",
        });
        return;
      }

      clearUser();
      addToast({
        type: "success",
        message: "Logged out",
      });
      router.push("/login");
      router.refresh();
    } catch {
      addToast({
        type: "error",
        message: "Something went wrong. Please try again.",
      });
    }
  }

  return (
    <div className="flex max-w-full flex-wrap items-center gap-2 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs text-zinc-700 sm:text-sm dark:border-zinc-700 dark:text-zinc-200">
      <span className="max-w-[140px] truncate sm:max-w-[220px]">
        {email}
      </span>
      <span className="inline-flex rounded-md bg-zinc-100 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-700 sm:text-xs dark:bg-zinc-800 dark:text-zinc-200">
        {role}
      </span>
      <button
        type="button"
        onClick={handleLogout}
        className="rounded-md border border-zinc-300 bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-200 sm:py-1.5 sm:text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
      >
        Logout
      </button>
    </div>
  );
}

