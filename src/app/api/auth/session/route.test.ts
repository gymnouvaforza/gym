import { beforeEach, describe, expect, it, vi } from "vitest";

const sessionRouteMocks = vi.hoisted(() => ({
  verifyFirebaseSessionToken: vi.fn(),
}));

vi.mock("@/lib/firebase/server", () => ({
  FIREBASE_SESSION_COOKIE: "gym_firebase_session",
  verifyFirebaseSessionToken: sessionRouteMocks.verifyFirebaseSessionToken,
}));

vi.mock("@/lib/env", () => ({
  hasFirebaseAdminEnv: () => true,
}));

describe("POST /api/auth/session", () => {
  beforeEach(() => {
    sessionRouteMocks.verifyFirebaseSessionToken.mockReset();
  });

  it("stores the verified firebase id token in a secure cookie", async () => {
    sessionRouteMocks.verifyFirebaseSessionToken.mockResolvedValue({
      uid: "firebase-user-1",
    });

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/auth/session", {
        method: "POST",
        body: JSON.stringify({
          idToken: "token_123",
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(sessionRouteMocks.verifyFirebaseSessionToken).toHaveBeenCalledWith("token_123");
    expect(response.headers.get("set-cookie")).toContain("gym_firebase_session=token_123");
  });

  it("returns 200 if idToken is missing (clears session)", async () => {
    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/auth/session", {
        method: "POST",
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  it("returns 401 if idToken is invalid", async () => {
    sessionRouteMocks.verifyFirebaseSessionToken.mockRejectedValue(new Error("Invalid token"));

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/auth/session", {
        method: "POST",
        body: JSON.stringify({
          idToken: "bad_token",
        }),
      }),
    );

    expect(response.status).toBe(401);
  });
});
