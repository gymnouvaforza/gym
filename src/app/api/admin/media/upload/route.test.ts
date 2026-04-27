import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAdminUser: vi.fn(),
  getDashboardAccessState: vi.fn(),
  optimizeImage: vi.fn(),
  upload: vi.fn(),
  from: vi.fn(),
  getServerSupabaseEnv: vi.fn().mockReturnValue({ serviceRoleKey: "test-key" }),
  hasFirebaseAdminEnv: vi.fn().mockReturnValue(true),
  hasSupabaseServiceRole: vi.fn().mockReturnValue(true),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockReturnValue({ get: vi.fn() }),
}));

vi.mock("@/lib/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth")>();
  return {
    ...actual,
    requireAdminUser: mocks.requireAdminUser,
    getDashboardAccessState: mocks.getDashboardAccessState,
  };
});

vi.mock("@/lib/env", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/env")>();
  return {
    ...actual,
    getServerSupabaseEnv: mocks.getServerSupabaseEnv,
    hasFirebaseAdminEnv: mocks.hasFirebaseAdminEnv,
    hasSupabaseServiceRole: mocks.hasSupabaseServiceRole,
  };
});

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn().mockReturnValue({
    storage: {
      from: mocks.from.mockReturnValue({
        upload: mocks.upload,
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: "http://test.com/image.png" } }),
      }),
    },
  }),
}));

vi.mock("@/lib/media/optimize-image", () => ({
  optimizeImage: mocks.optimizeImage,
}));

import { POST } from "./route";

function buildRequest(formData: FormData) {
  return new Request("http://localhost/api/admin/media/upload", {
    method: "POST",
    body: formData,
  });
}

describe("POST /api/admin/media/upload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NODE_ENV", "test");
    mocks.getDashboardAccessState.mockResolvedValue({
      user: { id: "admin-1", email: "admin@test.com" },
      accessMode: "admin",
      accessWarning: null
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uploads optimized images and returns their metadata", async () => {
    mocks.requireAdminUser.mockResolvedValue({ 
      id: "admin-1",
      app_metadata: { roles: ["admin"] }
    } as unknown as { id: string; app_metadata: { roles: string[] } });
    mocks.optimizeImage.mockResolvedValue({
      data: Buffer.from("optimized"),
      contentType: "image/webp",
      width: 100,
      height: 100,
    });
    mocks.upload.mockResolvedValue({ data: { path: "path/to/image" }, error: null });

    const formData = new FormData();
    formData.append("file", new Blob(["test"], { type: "image/png" }), "test.png");
    formData.append("scope", "product");

    const response = await POST(buildRequest(formData));
    expect(response.status).toBe(200);
  });

  it("rejects unauthenticated uploads", async () => {
    mocks.getDashboardAccessState.mockResolvedValue({
      user: null,
      accessMode: null,
      accessWarning: null
    });

    const formData = new FormData();
    formData.append("scope", "product");
    const response = await POST(buildRequest(formData));
    expect(response.status).toBe(401);
  });
});
