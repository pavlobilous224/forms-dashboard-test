import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, type AuthSession } from "@/lib/auth-shared";
import { loginSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.parse(body);

    const session: AuthSession = {
      email: parsed.email,
      role: parsed.role,
    };

    const response = NextResponse.json({ ok: true });
    const store = await cookies();
    store.set(AUTH_COOKIE_NAME, JSON.stringify(session), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 400 },
    );
  }
}

