import type { Metadata } from "next";
import { headers } from "next/headers";
import { FormsPageContent } from "@/app/forms/FormsPageContent";
import type { Form } from "@/lib/types";

export const metadata: Metadata = {
  title: "Forms – Forms Dashboard",
  description: "View and manage all forms in the dashboard.",
};

async function fetchForms(): Promise<Form[]> {
  const hdrs = await headers();
  const host = hdrs.get("host");
  const protocol =
    process.env.NODE_ENV === "development" ? "http" : "https";
  const url = new URL("/api/forms", `${protocol}://${host}`);

  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Failed to fetch forms");
  }

  const data = (await response.json()) as { data: Form[] };
  return data.data;
}

export default async function FormsPage() {
  const forms = await fetchForms();

  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Forms
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          View and manage all forms. Admins can create and edit forms.
        </p>
      </div>
      <FormsPageContent forms={forms} />
    </div>
  );
}

