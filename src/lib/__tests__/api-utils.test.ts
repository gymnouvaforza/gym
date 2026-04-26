import { describe, expect, it, vi, beforeEach } from "vitest";
import { requireRoles, validateBody } from "../api-utils";
import { z } from "zod";
import { DASHBOARD_ADMIN_ROLE } from "../user-roles";

const authMocks = vi.hoisted(() => ({
  getDashboardAccessState: vi.fn(),
  getAuthenticatedUser: vi.fn(),
}));

vi.mock("../auth", () => ({
  getDashboardAccessState: authMocks.getDashboardAccessState,
  getAuthenticatedUser: authMocks.getAuthenticatedUser,
}));

describe("api-utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("validateBody", () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });

    it("returns data if validation succeeds", async () => {
      const request = new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ name: "John", age: 30 }),
      });

      const result = await validateBody(request, schema);
      expect("data" in result && result.data).toEqual({ name: "John", age: 30 });
    });

    it("returns error response if validation fails", async () => {
      const request = new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ name: "John" }), // missing age
      });

      const result = await validateBody(request, schema);
      expect("errorResponse" in result).toBe(true);
      if ("errorResponse" in result && result.errorResponse) {
        expect(result.errorResponse.status).toBe(400);
      }
    });

    it("returns error response if JSON is invalid", async () => {
      const request = new Request("http://localhost", {
        method: "POST",
        body: "invalid json",
      });

      const result = await validateBody(request, schema);
      expect("errorResponse" in result).toBe(true);
      if ("errorResponse" in result && result.errorResponse) {
        expect(result.errorResponse.status).toBe(400);
      }
    });
  });

  describe("requireRoles", () => {
    it("returns success: true if role matches", async () => {
      authMocks.getDashboardAccessState.mockResolvedValue({
        user: { id: "user-1", email: "admin@gym.com" },
        accessMode: "admin",
      });

      const result = await requireRoles([DASHBOARD_ADMIN_ROLE]);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.accessMode).toBe("admin");
      }
    });

    it("returns success: true if user is superadmin", async () => {
      authMocks.getDashboardAccessState.mockResolvedValue({
        user: { id: "user-1", email: "superadmin@gym.com" },
        accessMode: "superadmin",
      });

      const result = await requireRoles([DASHBOARD_ADMIN_ROLE]);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.accessMode).toBe("superadmin");
      }
    });

    it("returns success: false if role does not match", async () => {
      authMocks.getDashboardAccessState.mockResolvedValue({
        user: { id: "user-1", email: "trainer@gym.com" },
        accessMode: "trainer",
      });

      const result = await requireRoles([DASHBOARD_ADMIN_ROLE]);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errorResponse.status).toBe(403);
      }
    });

    it("returns success: false if user is not authenticated", async () => {
      authMocks.getDashboardAccessState.mockResolvedValue({
        user: null,
        accessMode: null,
      });

      const result = await requireRoles([DASHBOARD_ADMIN_ROLE]);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errorResponse.status).toBe(401);
      }
    });
  });
});
