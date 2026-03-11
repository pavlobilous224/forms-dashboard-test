import type { Role } from "./types";

export const AUTH_COOKIE_NAME = "forms_auth";

export interface AuthSession {
  email: string;
  role: Role;
}

export function parseAuthCookie(raw: string | undefined): AuthSession | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AuthSession;
    if (
      !parsed.email ||
      (parsed.role !== "individual" && parsed.role !== "admin")
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

