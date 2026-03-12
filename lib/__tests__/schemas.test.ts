import { formSchema, loginSchema } from "../schemas";

describe("loginSchema", () => {
  it("accepts a valid email and role", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      role: "admin",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      role: "individual",
    });

    expect(result.success).toBe(false);
  });
});

describe("formSchema", () => {
  it("accepts a valid form payload", () => {
    const result = formSchema.safeParse({
      title: "New form",
      description: "Optional description",
      fieldsCount: 3,
      status: "draft",
    });

    expect(result.success).toBe(true);
  });

  it("rejects too short title", () => {
    const result = formSchema.safeParse({
      title: "ab",
      description: "",
      fieldsCount: 1,
      status: "draft",
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid status", () => {
    const result = formSchema.safeParse({
      title: "Valid title",
      description: "",
      fieldsCount: 1,
      // @ts-expect-error – testing runtime validation
      status: "invalid-status",
    });

    expect(result.success).toBe(false);
  });
});

