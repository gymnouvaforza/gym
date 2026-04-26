import { describe, expect, it, vi, beforeEach } from "vitest";

const firebaseMocks = vi.hoisted(() => ({
  verifyFirebaseSessionToken: vi.fn(),
}));

vi.mock("@/lib/firebase/server", () => ({
  FIREBASE_SESSION_COOKIE: "gym_firebase_session",
  verifyFirebaseSessionToken: firebaseMocks.verifyFirebaseSessionToken,
}));

vi.mock("@/lib/env", () => ({
  hasFirebaseAdminEnv: vi.fn().mockReturnValue(true),
}));

import { POST } from "../route";

describe("POST /api/auth/session - Security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fails if token is invalid (401)", async () => {
    firebaseMocks.verifyFirebaseSessionToken.mockRejectedValue(new Error("Invalid token"));

    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ idToken: "fake-token" }),
      })
    );

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toContain("invalido");
  });

  it("clears cookie if idToken is missing in body", async () => {
    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({}),
      })
    );

    expect(response.status).toBe(200);
    const cookie = response.headers.get("set-cookie");
    expect(cookie).toContain("gym_firebase_session=;");
    expect(cookie).toContain("Max-Age=0");
  });

  it("handles invalid JSON body gracefully", async () => {
    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: "invalid-json",
      })
    );

    // Should clear cookie (fallback for no token)
    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
  });

  it("sets session cookie if token is valid", async () => {
    firebaseMocks.verifyFirebaseSessionToken.mockResolvedValue({ uid: "user-1" });

    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ idToken: "valid-token" }),
      })
    );

    expect(response.status).toBe(200);
    const cookie = response.headers.get("set-cookie");
    expect(cookie).toContain("gym_firebase_session=valid-token");
  });
});
