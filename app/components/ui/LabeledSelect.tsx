"use client";

export interface SelectOption {
  value: string;
  label: string;
}

interface LabeledSelectProps {
  id: string;
  label: string;
  value: string;
  options: ReadonlyArray<SelectOption>;
  onChange: (value: string) => void;
  className?: string;
  layout?: "horizontal" | "vertical";
}

export function LabeledSelect({
  id,
  label,
  value,
  options,
  onChange,
  className = "",
  layout = "horizontal",
}: LabeledSelectProps) {
  const isVertical = layout === "vertical";
  return (
    <div
      className={
        isVertical
          ? `flex flex-col gap-1 ${className}`.trim()
          : `flex items-center gap-3 ${className}`.trim()
      }
    >
      <label
        htmlFor={id}
        className={
          isVertical
            ? "text-sm font-medium text-zinc-800 dark:text-zinc-100"
            : "shrink-0 text-sm font-medium text-zinc-600 dark:text-zinc-400"
        }
      >
        {label}
      </label>
      <select
        id={id}
        className="block w-full min-w-[120px] appearance-none rounded-md border border-zinc-300 bg-white px-3 py-2 pr-9 text-sm text-zinc-800 shadow-sm outline-none transition hover:bg-zinc-50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m19 9-7 7-7-7'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 0.5rem center",
          backgroundSize: "1.25rem 1.25rem",
        }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
