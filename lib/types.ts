export const roleValues = ["individual", "admin"] as const;
export type Role = (typeof roleValues)[number];

export const formStatusValues = ["draft", "active", "archived"] as const;
export type FormStatus = (typeof formStatusValues)[number];

export interface Form {
  id: string;
  title: string;
  description?: string;
  fieldsCount: number;
  status: FormStatus;
  createdAt: string;
  updatedAt: string;
}

