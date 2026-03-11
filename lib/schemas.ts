import { z } from "zod";
import { formStatusValues, roleValues } from "./types";

export const roleSchema = z.enum(roleValues);

export const formStatusSchema = z.enum(formStatusValues);

export const loginSchema = z.object({
  email: z.string().email(),
  role: roleSchema,
});

export const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z
    .string()
    .max(1000, "Description is too long")
    .optional()
    .or(z.literal("").optional()),
  fieldsCount: z
    .number()
    .int("Fields count must be an integer")
    .min(0, "Fields count cannot be negative")
    .max(50, "Fields count cannot exceed 50"),
  status: formStatusSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type FormInput = z.infer<typeof formSchema>;

