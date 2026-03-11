import { cookies } from "next/headers";
import type { Role } from "./types";
import {
  AUTH_COOKIE_NAME,
  parseAuthCookie,
  type AuthSession,
} from "./auth-shared";

export { AUTH_COOKIE_NAME, parseAuthCookie };
export type { AuthSession };

export async function getServerSession(): Promise<AuthSession | null> {
  const store = await cookies();
  const raw = store.get(AUTH_COOKIE_NAME)?.value;
  return parseAuthCookie(raw);
}

export function hasAtLeastRole(
  session: AuthSession | null,
  required: Role,
): boolean {
  if (!session) return false;
  if (required === "individual") return true;
  return session.role === "admin";
}


