import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const welcomeRouteMocks = vi.hoisted(() => ({
  hasSmtpEnv: vi.fn(),
  getSmtpEnv: vi.fn(),
  getFirebaseAdminAuth: vi.fn(),
  getMarketingData: vi.fn(),
  sendMemberWelcomeEmail: vi.fn(),
}));

vi.mock("@/lib/env", () => ({
  hasSmtpEnv: welcomeRouteMocks.hasSmtpEnv,
  getSmtpEnv: welcomeRouteMocks.getSmtpEnv,
}));

vi.mock("@/lib/firebase/server", () => ({
  getFirebaseAdminAuth: welcomeRouteMocks.getFirebaseAdminAuth,
}));

vi.mock("@/lib/data/site", () => ({
  getMarketingData: welcomeRouteMocks.getMarketingData,
}));

vi.mock("@/lib/email/welcome-member", () => ({
  sendMemberWelcomeEmail: welcomeRouteMocks.sendMemberWelcomeEmail,
}));

import { POST } from "@/app/api/auth/welcome/route";

describe("POST /api/auth/welcome", () => {
  beforeEach(() => {
    welcomeRouteMocks.hasSmtpEnv.mockReturnValue(true);
    welcomeRouteMocks.getSmtpEnv.mockReturnValue({
      fromEmail: "Nuova Forza <info@nuovaforzagym.com>",
    });
    welcomeRouteMocks.getFirebaseAdminAuth.mockReturnValue({
      getUserByEmail: vi.fn().mockResolvedValue({
        email: "member@gym.com",
        uid: "user-1",
      }),
    });
    welcomeRouteMocks.getMarketingData.mockResolvedValue({
      settings: {
        site_name: "Nuova Forza",
        transactional_from_email: "pedidos@gmail.com",
      },
    });
    welcomeRouteMocks.sendMemberWelcomeEmail.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("sends the welcome email when the auth user exists", async () => {
    const response = await POST(
      new Request("http://localhost/api/auth/welcome", {
        method: "POST",
        body: JSON.stringify({
          email: "member@gym.com",
        }),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(welcomeRouteMocks.sendMemberWelcomeEmail).toHaveBeenCalledWith(
      "member@gym.com",
      "Nuova Forza",
      "Nuova Forza <info@nuovaforzagym.com>",
      "pedidos@gmail.com",
    );
    expect(payload).toEqual({ queued: true });
  });

  it("returns a non-blocking response when SMTP is not configured", async () => {
    welcomeRouteMocks.hasSmtpEnv.mockReturnValue(false);

    const response = await POST(
      new Request("http://localhost/api/auth/welcome", {
        method: "POST",
        body: JSON.stringify({
          email: "member@gym.com",
        }),
      }),
    );

    expect(response.status).toBe(202);
    expect(welcomeRouteMocks.sendMemberWelcomeEmail).not.toHaveBeenCalled();
  });
});
