"use client";

import { ReactNode, useEffect } from "react";
import { ToastProvider } from "./ToastProvider";
import { useAuthStore } from "@/store/useAuthStore";
import type { AuthSession } from "@/lib/auth";

interface RootClientProvidersProps {
  initialSession: AuthSession | null;
  children: ReactNode;
}

export function RootClientProviders({
  initialSession,
  children,
}: RootClientProvidersProps) {
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);

  useEffect(() => {
    if (initialSession) {
      setUser({ email: initialSession.email, role: initialSession.role });
    } else {
      clearUser();
    }
  }, [initialSession, setUser, clearUser]);

  return (
    <>
      {children}
      <ToastProvider />
    </>
  );
}

