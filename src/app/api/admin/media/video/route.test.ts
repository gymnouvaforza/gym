import { describe, expect, it, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  upload: vi.fn(),
  from: vi.fn(),
  requireAdminUser: vi.fn(),
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

import { POST } from "./route";

function buildRequest(formData?: FormData) {
  return new Request("http://localhost/api/admin/media/video", {
    method: "POST",
    body: formData,
  });
}

describe("POST /api/admin/media/video", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NODE_ENV = "test";
  });

  it("uploads valid videos to the media bucket", async () => {
    mocks.requireAdminUser.mockResolvedValue({ 
      id: "admin-1",
      app_metadata: { roles: ["admin"] }
    } as any);
    mocks.upload.mockResolvedValue({ data: { path: "path/to/video" }, error: null });

    const formData = new FormData();
    formData.append("file", new Blob(["test"], { type: "video/mp4" }), "test.mp4");

    const response = await POST(buildRequest(formData));
    expect(response.status).toBe(200);
  });

  it("rejects unauthenticated uploads", async () => {
    mocks.requireAdminUser.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });

    await expect(POST(buildRequest())).rejects.toThrow("NEXT_REDIRECT");
  });
});
