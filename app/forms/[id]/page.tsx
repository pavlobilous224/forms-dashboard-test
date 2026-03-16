import { notFound } from "next/navigation";
import { FormEditor } from "@/app/components/forms/FormEditor";
import { getFormById, NotFoundError } from "@/lib/forms-repository";

interface FormDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function FormDetailsPage({
  params,
}: FormDetailsPageProps) {
  const { id } = await params;
  let form;
  try {
    form = await getFormById(id);
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }
    throw error;
  }

  return (
    <div className="flex w-full flex-1 items-start justify-center">
      <FormEditor
        mode="edit"
        formId={form.id}
        initialValues={{
          title: form.title,
          description: form.description ?? "",
          fieldsCount: form.fieldsCount,
          status: form.status,
        }}
      />
    </div>
  );
}

