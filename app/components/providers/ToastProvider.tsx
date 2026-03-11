"use client";

import { useEffect } from "react";
import { useToastStore } from "@/store/useToastStore";

export function ToastProvider() {
  const { toasts, removeToast } = useToastStore();

  useEffect(() => {
    if (!toasts.length) return;
    const timers = toasts.map((toast) =>
      setTimeout(() => removeToast(toast.id), 4000),
    );
    return () => {
      timers.forEach(clearTimeout);
    };
  }, [toasts, removeToast]);

  if (!toasts.length) return null;

  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-md px-4 py-2 text-sm shadow-md ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : toast.type === "error"
                ? "bg-red-600 text-white"
                : "bg-zinc-800 text-white"
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}

