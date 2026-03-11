import { NextResponse } from "next/server";
import { getForms, createForm, ValidationError } from "@/lib/forms-repository";
import { formSchema } from "@/lib/schemas";
import { getServerSession } from "@/lib/auth";

export async function GET() {
  try {
    const forms = await getForms();
    return NextResponse.json({ data: forms });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load forms" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = formSchema.parse(body);
    const created = await createForm(parsed);
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: "Validation failed" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Failed to create form" },
      { status: 500 },
    );
  }
}

