import { AUTH_COOKIE_NAME, parseAuthCookie } from "../auth-shared";

describe("auth-shared", () => {
  it("parses a valid auth cookie", () => {
    const raw = JSON.stringify({
      email: "user@example.com",
      role: "admin",
    });

    const session = parseAuthCookie(raw);

    expect(session).toEqual({
      email: "user@example.com",
      role: "admin",
    });
  });

  it("returns null for invalid json", () => {
    const session = parseAuthCookie("not-json");
    expect(session).toBeNull();
  });

  it("returns null for missing fields or invalid role", () => {
    expect(parseAuthCookie(undefined)).toBeNull();
    expect(parseAuthCookie(JSON.stringify({ email: "" }))).toBeNull();
    expect(
      parseAuthCookie(
        JSON.stringify({ email: "user@example.com", role: "unknown" }),
      ),
    ).toBeNull();
  });

  it("exposes the expected cookie name", () => {
    expect(AUTH_COOKIE_NAME).toBe("forms_auth");
  });
});

