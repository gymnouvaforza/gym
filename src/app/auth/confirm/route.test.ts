import { beforeEach, describe, expect, it, vi } from "vitest";

const confirmRouteMocks = vi.hoisted(() => ({
  createSupabaseServerClient: vi.fn(),
  exchangeCodeForSession: vi.fn(),
  verifyOtp: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: confirmRouteMocks.createSupabaseServerClient,
}));

describe("GET /auth/confirm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exchanges the auth code and redirects to the requested internal path", async () => {
    confirmRouteMocks.exchangeCodeForSession.mockResolvedValue({ error: null });
    confirmRouteMocks.verifyOtp.mockResolvedValue({ error: null });
    confirmRouteMocks.createSupabaseServerClient.mockResolvedValue({
      auth: {
        exchangeCodeForSession: confirmRouteMocks.exchangeCodeForSession,
        verifyOtp: confirmRouteMocks.verifyOtp,
      },
    });

    const { GET } = await import("./route");
    const response = await GET(
      new Request(
        "http://localhost:3000/auth/confirm?code=code-123&next=%2Fregistro%2Fcompletado%3Fconfirmed%3D1",
      ),
    );

    expect(confirmRouteMocks.exchangeCodeForSession).toHaveBeenCalledWith("code-123");
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/registro/completado?confirmed=1",
    );
  });

  it("verifies a token hash when the auth email template points to the callback", async () => {
    confirmRouteMocks.exchangeCodeForSession.mockResolvedValue({ error: null });
    confirmRouteMocks.verifyOtp.mockResolvedValue({ error: null });
    confirmRouteMocks.createSupabaseServerClient.mockResolvedValue({
      auth: {
        exchangeCodeForSession: confirmRouteMocks.exchangeCodeForSession,
        verifyOtp: confirmRouteMocks.verifyOtp,
      },
    });

    const { GET } = await import("./route");
    const response = await GET(
      new Request(
        "http://localhost:3000/auth/confirm?token_hash=token-123&type=email&next=%2Fregistro%2Fcompletado%3Fconfirmed%3D1",
      ),
    );

    expect(confirmRouteMocks.verifyOtp).toHaveBeenCalledWith({
      token_hash: "token-123",
      type: "email",
    });
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/registro/completado?confirmed=1",
    );
  });

  it("ignores external redirects and falls back to the local success page", async () => {
    confirmRouteMocks.exchangeCodeForSession.mockResolvedValue({ error: null });
    confirmRouteMocks.verifyOtp.mockResolvedValue({ error: null });
    confirmRouteMocks.createSupabaseServerClient.mockResolvedValue({
      auth: {
        exchangeCodeForSession: confirmRouteMocks.exchangeCodeForSession,
        verifyOtp: confirmRouteMocks.verifyOtp,
      },
    });

    const { GET } = await import("./route");
    const response = await GET(
      new Request("http://localhost:3000/auth/confirm?code=code-123&next=https://evil.com/hijack"),
    );

    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/registro/completado?confirmed=1",
    );
  });

  it("redirects to the error state when the callback cannot be validated", async () => {
    confirmRouteMocks.exchangeCodeForSession.mockResolvedValue({
      error: new Error("invalid code"),
    });
    confirmRouteMocks.verifyOtp.mockResolvedValue({
      error: new Error("invalid token"),
    });
    confirmRouteMocks.createSupabaseServerClient.mockResolvedValue({
      auth: {
        exchangeCodeForSession: confirmRouteMocks.exchangeCodeForSession,
        verifyOtp: confirmRouteMocks.verifyOtp,
      },
    });

    const { GET } = await import("./route");
    const response = await GET(new Request("http://localhost:3000/auth/confirm?code=broken"));

    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/registro/completado?error=confirm-link-invalid",
    );
  });
});
