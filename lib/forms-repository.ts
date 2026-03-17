import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { Form } from "./types";
import { formSchema, type FormInput } from "./schemas";

const FORMS_FILE_PATH = path.join(process.cwd(), "data", "forms.json");

let inMemoryForms: Form[] | null = null;

const formRecordSchema = formSchema.extend({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const formListSchema = z.array(formRecordSchema);

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

// TODO: swap this JSON file storage for a real database if the project grows
async function readFormsFromFile(): Promise<Form[]> {
  // If we ever fail to write on a read-only deployment (e.g. Vercel),
  // we fall back to an in-memory store for the lifetime of that server instance.
  if (inMemoryForms) {
    return [...inMemoryForms].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }

  try {
    const fileContents = await fs.readFile(FORMS_FILE_PATH, "utf8");
    const parsed = JSON.parse(fileContents);
    const result = formListSchema.parse(parsed);

    return result.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error("Stored forms data is invalid");
    }
    throw new Error("Failed to read forms from storage");
  }
}

async function writeFormsToFile(forms: Form[]): Promise<void> {
  try {
    const data = JSON.stringify(forms, null, 2);
    await fs.writeFile(FORMS_FILE_PATH, data, "utf8");
  } catch (error) {
    const maybeErr = error as NodeJS.ErrnoException;
    if (maybeErr && (maybeErr.code === "EROFS" || maybeErr.code === "EPERM")) {
      inMemoryForms = forms;
      return;
    }

    throw new Error("Failed to write forms to storage");
  }
}

export async function getForms(): Promise<Form[]> {
  return readFormsFromFile();
}

export async function getFormById(id: string): Promise<Form> {
  const forms = await readFormsFromFile();
  const form = forms.find((item) => item.id === id);

  if (!form) {
    throw new NotFoundError(`Form with id "${id}" not found`);
  }

  return form;
}

export async function createForm(input: FormInput): Promise<Form> {
  const validated = formSchema.parse(input);
  const now = new Date().toISOString();
  const id = `form-${randomUUID()}`;

  const newForm: Form = {
    id,
    title: validated.title,
    description: validated.description || undefined,
    fieldsCount: validated.fieldsCount,
    status: validated.status,
    createdAt: now,
    updatedAt: now,
  };

  const forms = await readFormsFromFile();
  const updated = [newForm, ...forms];
  await writeFormsToFile(updated);

  return newForm;
}

export async function updateForm(
  id: string,
  input: FormInput,
): Promise<Form> {
  const validated = formSchema.parse(input);
  const forms = await readFormsFromFile();
  const index = forms.findIndex((item) => item.id === id);

  if (index === -1) {
    throw new NotFoundError(`Form with id "${id}" not found`);
  }

  const existing = forms[index];
  const now = new Date().toISOString();

  const updatedForm: Form = {
    ...existing,
    title: validated.title,
    description: validated.description || undefined,
    fieldsCount: validated.fieldsCount,
    status: validated.status,
    updatedAt: now,
  };

  const updatedForms = [...forms];
  updatedForms[index] = updatedForm;

  await writeFormsToFile(updatedForms);

  return updatedForm;
}

export async function deleteForm(id: string): Promise<void> {
  const forms = await readFormsFromFile();
  const filtered = forms.filter((item) => item.id !== id);

  if (filtered.length === forms.length) {
    throw new NotFoundError(`Form with id "${id}" not found`);
  }

  await writeFormsToFile(filtered);
}

