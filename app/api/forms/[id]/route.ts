import { NextResponse } from "next/server";
import {
  getFormById,
  updateForm,
  deleteForm,
  NotFoundError,
} from "@/lib/forms-repository";
import { formSchema } from "@/lib/schemas";
import { getServerSession } from "@/lib/server-auth";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const form = await getFormById(id);
    return NextResponse.json({ data: form });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to load form" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = formSchema.parse(body);
    const updated = await updateForm(id, parsed);
    return NextResponse.json({ data: updated });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Failed to update form" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    await deleteForm(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to delete form" },
      { status: 500 },
    );
  }
}

