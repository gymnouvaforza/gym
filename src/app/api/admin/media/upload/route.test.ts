import { describe, expect, it, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAdminUser: vi.fn(),
  optimizeImage: vi.fn(),
  upload: vi.fn(),
  from: vi.fn(),
  getServerSupabaseEnv: vi.fn().mockReturnValue({ serviceRoleKey: "test-key" }),
  hasFirebaseAdminEnv: vi.fn().mockReturnValue(true),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockReturnValue({ get: vi.fn() }),
}));

vi.mock("@/lib/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth")>();
  return {
    ...actual,
    requireAdminUser: mocks.requireAdminUser,
  };
});

vi.mock("@/lib/env", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/env")>();
  return {
    ...actual,
    getServerSupabaseEnv: mocks.getServerSupabaseEnv,
    hasFirebaseAdminEnv: mocks.hasFirebaseAdminEnv,
  };
});

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn().mockReturnValue({
    storage: {
      from: mocks.from.mockReturnValue({
        upload: mocks.upload,
      }),
    },
  }),
}));

vi.mock("@/lib/api-utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api-utils")>();
  return {
    ...actual,
    optimizeImage: mocks.optimizeImage,
  };
});

import { POST } from "./route";

function buildRequest(formData: any) {
  return new Request("http://localhost/api/admin/media/upload", {
    method: "POST",
    body: formData,
  });
}

describe("POST /api/admin/media/upload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NODE_ENV = "test";
  });

  it("uploads optimized images and returns their metadata", async () => {
    mocks.requireAdminUser.mockResolvedValue({ 
      id: "admin-1",
      app_metadata: { roles: ["admin"] }
    } as any);
    mocks.optimizeImage.mockResolvedValue({
      data: Buffer.from("optimized"),
      contentType: "image/webp",
      width: 100,
      height: 100,
    });
    mocks.upload.mockResolvedValue({ data: { path: "path/to/image" }, error: null });

    const formData = new FormData();
    formData.append("file", new Blob(["test"], { type: "image/png" }), "test.png");

    const response = await POST(buildRequest(formData));
    expect(response.status).toBe(200);
  });

  it("rejects unauthenticated uploads", async () => {
    mocks.requireAdminUser.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });

    const formData = new FormData();
    await expect(POST(buildRequest(formData))).rejects.toThrow("NEXT_REDIRECT");
  });
});
