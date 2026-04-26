import { describe, expect, it, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentMemberUser: vi.fn(),
  resolveCartIdFromRequest: vi.fn(),
  listPickupRequests: vi.fn(),
  createPickupRequest: vi.fn(),
  resolveOrCreateMemberCommerceCustomer: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockReturnValue({ 
    get: vi.fn(),
    set: vi.fn()
  }),
}));

vi.mock("@/lib/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth")>();
  return {
    ...actual,
    getCurrentMemberUser: mocks.getCurrentMemberUser,
    getAuthenticatedUser: mocks.getCurrentMemberUser,
  };
});

vi.mock("@/lib/cart/member-bridge", () => ({
  createPickupRequest: mocks.createPickupRequest,
  listPickupRequests: mocks.listPickupRequests,
  resolveCartIdFromRequest: mocks.resolveCartIdFromRequest,
  resolveOrCreateMemberCommerceCustomer: mocks.resolveOrCreateMemberCommerceCustomer,
}));

import { POST } from "./route";

describe("POST /api/cart/pickup-request", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a pickup request for a member", async () => {
    mocks.resolveCartIdFromRequest.mockResolvedValue("cart_123");
    mocks.getCurrentMemberUser.mockResolvedValue({ 
        id: "user-1", 
        email: "test@test.com",
        app_metadata: { roles: ["member"] }
    });
    mocks.listPickupRequests.mockResolvedValue({ pickup_requests: [] });
    mocks.resolveOrCreateMemberCommerceCustomer.mockResolvedValue({ medusa_customer_id: "cus_1" });
    mocks.createPickupRequest.mockResolvedValue({ 
      pickup_request: { id: "pr_1", cart_id: "cart_123" } 
    });

    const response = await POST(new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ cartId: "cart_123" })
    }));
    
    expect(response.status).toBe(200);
  });

  it("fails if cartId cannot be resolved", async () => {
    mocks.resolveCartIdFromRequest.mockResolvedValue(null);
    const response = await POST(new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({})
    }));
    expect(response.status).toBe(400);
  });
});
