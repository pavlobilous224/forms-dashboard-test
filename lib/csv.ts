import type { Form } from "./types";

const CSV_HEADER = "id,title,description,fieldsCount,status,updatedAt";

function escapeCsvValue(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function formsToCsv(forms: Form[]): string {
  const rows = forms.map((form) =>
    [
      form.id,
      escapeCsvValue(form.title),
      escapeCsvValue(form.description ?? ""),
      form.fieldsCount.toString(),
      form.status,
      new Date(form.updatedAt).toISOString().slice(0, 10),
    ].join(","),
  );

  return [CSV_HEADER, ...rows].join("\n");
}

