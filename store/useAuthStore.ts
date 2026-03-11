"use client";

import { create } from "zustand";
import type { Role } from "@/lib/types";

interface AuthState {
  email: string | null;
  role: Role | null;
  isLoggedIn: boolean;
  setUser: (data: { email: string; role: Role }) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  email: null,
  role: null,
  isLoggedIn: false,
  setUser: ({ email, role }) =>
    set({
      email,
      role,
      isLoggedIn: true,
    }),
  clearUser: () =>
    set({
      email: null,
      role: null,
      isLoggedIn: false,
    }),
}));

