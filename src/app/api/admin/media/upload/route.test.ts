import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const uploadRouteMocks = vi.hoisted(() => ({
  createSupabaseAdminClient: vi.fn(),
  getCurrentAdminUser: vi.fn(),
  hasSupabaseServiceRole: vi.fn(),
  optimizeImage: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getCurrentAdminUser: uploadRouteMocks.getCurrentAdminUser,
}));

vi.mock("@/lib/env", () => ({
  hasSupabaseServiceRole: uploadRouteMocks.hasSupabaseServiceRole,
}));

vi.mock("@/lib/media/optimize-image", () => ({
  optimizeImage: uploadRouteMocks.optimizeImage,
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseAdminClient: uploadRouteMocks.createSupabaseAdminClient,
}));

import { POST } from "@/app/api/admin/media/upload/route";

function buildRequest({
  file = new File([Buffer.from("fake-image")], "upload.png", { type: "image/png" }),
  scope = "product",
}: {
  file?: File;
  scope?: string;
}) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("scope", scope);

  return new Request("http://localhost/api/admin/media/upload", {
    method: "POST",
    body: formData,
  });
}

describe("POST /api/admin/media/upload", () => {
  beforeEach(() => {
    uploadRouteMocks.getCurrentAdminUser.mockResolvedValue({
      id: "admin-1",
      email: "admin@gym.test",
    });
    uploadRouteMocks.hasSupabaseServiceRole.mockReturnValue(true);
    uploadRouteMocks.optimizeImage.mockResolvedValue({
      buffer: Buffer.from("optimized-image"),
      bytes: 128,
      contentType: "image/webp",
      extension: "webp",
      width: 640,
      height: 640,
    });
    uploadRouteMocks.createSupabaseAdminClient.mockReturnValue({
      storage: {
        from: vi.fn(() => ({
          upload: vi.fn().mockResolvedValue({ error: null }),
          getPublicUrl: vi.fn(() => ({
            data: {
              publicUrl:
                "https://project.supabase.co/storage/v1/object/public/medusa-media/products/file.webp",
            },
          })),
        })),
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthenticated uploads", async () => {
    uploadRouteMocks.getCurrentAdminUser.mockResolvedValue(null);

    const response = await POST(buildRequest({}));
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.error).toContain("iniciar sesion");
  });

  it("blocks uploads when the service role key is missing", async () => {
    uploadRouteMocks.hasSupabaseServiceRole.mockReturnValue(false);

    const response = await POST(buildRequest({}));
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload.error).toContain("SUPABASE_SERVICE_ROLE_KEY");
  });

  it("uploads optimized images and returns their metadata", async () => {
    const response = await POST(buildRequest({ scope: "team" }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(uploadRouteMocks.optimizeImage).toHaveBeenCalledWith(
      expect.objectContaining({
        contentType: "image/png",
      }),
    );
    expect(payload).toEqual({
      url: "https://project.supabase.co/storage/v1/object/public/medusa-media/products/file.webp",
      contentType: "image/webp",
      width: 640,
      height: 640,
      bytes: 128,
    });
  });
});
