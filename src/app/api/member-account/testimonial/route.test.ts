import { describe, expect, it, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentMemberUser: vi.fn(),
  retrieveAuthenticatedMemberTestimonial: vi.fn(),
  upsertAuthenticatedMemberTestimonial: vi.fn(),
  getAuthenticatedMemberTestimonial: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockReturnValue({ get: vi.fn() }),
}));

vi.mock("@/lib/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth")>();
  return {
    ...actual,
    getCurrentMemberUser: mocks.getCurrentMemberUser,
    getAuthenticatedUser: mocks.getCurrentMemberUser,
  };
});

vi.mock("@/lib/data/member-account", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/data/member-account")>();
  return {
    ...actual,
    getAuthenticatedMemberTestimonial: mocks.getAuthenticatedMemberTestimonial,
    upsertAuthenticatedMemberTestimonial: mocks.upsertAuthenticatedMemberTestimonial,
  };
});

import { GET, POST } from "./route";

describe("/api/member-account/testimonial", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the authenticated member testimonial", async () => {
    mocks.getCurrentMemberUser.mockResolvedValue({ 
        id: "user-1",
        app_metadata: { roles: ["member"] }
    });
    mocks.getAuthenticatedMemberTestimonial.mockResolvedValue({ id: "t-1", quote: "test" });

    const response = await GET();
    expect(response.status).toBe(200);
  });

  it("creates or updates the authenticated member testimonial", async () => {
    mocks.getCurrentMemberUser.mockResolvedValue({ 
        id: "user-1",
        app_metadata: { roles: ["member"] }
    });
    mocks.upsertAuthenticatedMemberTestimonial.mockResolvedValue({ id: "t-1" });

    const response = await POST(new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ quote: "new", rating: 5 })
    }));
    expect(response.status).toBe(200);
  });

  it("fails if user is anonymous", async () => {
    mocks.getCurrentMemberUser.mockResolvedValue(null);
    const response = await GET();
    expect(response.status).toBe(401);
  });
});
