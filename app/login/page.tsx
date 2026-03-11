import type { Metadata } from "next";
import { LoginForm } from "@/app/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Login – Forms Dashboard",
  description: "Sign in with a role to access the Forms Dashboard.",
};

export default function LoginPage() {
  return (
    <div className="flex w-full flex-1 items-center justify-center">
      <LoginForm />
    </div>
  );
}

