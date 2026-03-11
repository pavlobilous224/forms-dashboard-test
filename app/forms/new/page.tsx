import { FormEditor } from "@/app/components/forms/FormEditor";

export default function NewFormPage() {
  return (
    <div className="flex w-full flex-1 items-start justify-center">
      <FormEditor mode="create" />
    </div>
  );
}

