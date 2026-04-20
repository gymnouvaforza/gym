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
});
