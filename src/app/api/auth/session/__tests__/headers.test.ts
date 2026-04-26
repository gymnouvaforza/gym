import { describe, expect, it, vi, beforeEach } from "vitest";
import { POST } from "../route";

const authMocks = vi.hoisted(() => ({
  verifyFirebaseSessionToken: vi.fn(),
}));

vi.mock("@/lib/firebase/server", () => ({
  verifyFirebaseSessionToken: authMocks.verifyFirebaseSessionToken,
  FIREBASE_SESSION_COOKIE: "gym_firebase_session",
}));

vi.mock("@/lib/env", () => ({
  hasFirebaseAdminEnv: vi.fn().mockReturnValue(true),
}));

describe("API Headers and Cookies Hardening", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sets secure session cookies with httpOnly and sameSite", async () => {
    authMocks.verifyFirebaseSessionToken.mockResolvedValue({ uid: "user-1" });

    const request = new Request("http://localhost/api/auth/session", {
      method: "POST",
      body: JSON.stringify({ idToken: "valid-token" }),
    });

    const response = await POST(request);
    const cookieHeader = response.headers.get("set-cookie");

    expect(response.status).toBe(200);
    expect(cookieHeader).toContain("HttpOnly");
    expect(cookieHeader?.toLowerCase()).toContain("samesite=lax");
    expect(cookieHeader).toContain("Path=/");
  });
});
