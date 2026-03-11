"use client";

interface FormsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function FormsError({ reset }: FormsErrorProps) {
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center gap-3 text-center">
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Something went wrong
      </h1>
      <p className="max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
        We could not load the forms list. Please try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 shadow-sm transition hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
      >
        Try again
      </button>
    </div>
  );
}

