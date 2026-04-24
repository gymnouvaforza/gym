import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const videoRouteMocks = vi.hoisted(() => ({
  createSupabaseAdminClient: vi.fn(),
  getCurrentAdminUser: vi.fn(),
  hasSupabaseServiceRole: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getCurrentAdminUser: videoRouteMocks.getCurrentAdminUser,
}));

vi.mock("@/lib/env", () => ({
  hasSupabaseServiceRole: videoRouteMocks.hasSupabaseServiceRole,
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseAdminClient: videoRouteMocks.createSupabaseAdminClient,
}));

import { POST } from "@/app/api/admin/media/video/route";

function buildRequest(file = new File([Buffer.from("fake-video")], "upload.mp4", { type: "video/mp4" })) {
  const formData = new FormData();
  formData.append("file", file);

  return new Request("http://localhost/api/admin/media/video", {
    method: "POST",
    body: formData,
  });
}

describe("POST /api/admin/media/video", () => {
  const upload = vi.fn().mockResolvedValue({ error: null });
  const getPublicUrl = vi.fn(() => ({
    data: {
      publicUrl: "https://project.supabase.co/storage/v1/object/public/media/training-zones/videos/file.mp4",
    },
  }));
  const from = vi.fn(() => ({ upload, getPublicUrl }));

  beforeEach(() => {
    videoRouteMocks.getCurrentAdminUser.mockResolvedValue({
      id: "admin-1",
      email: "admin@gym.test",
    });
    videoRouteMocks.hasSupabaseServiceRole.mockReturnValue(true);
    videoRouteMocks.createSupabaseAdminClient.mockReturnValue({
      storage: { from },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthenticated uploads", async () => {
    videoRouteMocks.getCurrentAdminUser.mockResolvedValue(null);

    const response = await POST(buildRequest());
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.error).toContain("iniciar sesion");
  });

  it("blocks uploads when service role is missing", async () => {
    videoRouteMocks.hasSupabaseServiceRole.mockReturnValue(false);

    const response = await POST(buildRequest());
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload.error).toContain("SUPABASE_SERVICE_ROLE_KEY");
  });

  it("rejects invalid video mime types", async () => {
    const response = await POST(
      buildRequest(new File([Buffer.from("fake")], "upload.txt", { type: "text/plain" })),
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toContain("MP4");
  });

  it("rejects videos larger than 250MB", async () => {
    const largeFile = new File([], "too-big.mp4", { type: "video/mp4" });
    Object.defineProperty(largeFile, "size", { value: 251 * 1024 * 1024 });

    const request = new Request("http://localhost/api/admin/media/video", {
      method: "POST",
    });

    // Mock formData to return our file with overridden size
    request.formData = async () => {
      const fd = new FormData();
      fd.append("file", largeFile);
      return fd;
    };

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toContain("demasiado pesado");
  });

  it("uploads valid videos to the media bucket", async () => {
    const response = await POST(buildRequest());
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(from).toHaveBeenCalledWith("media");
    expect(upload).toHaveBeenCalledWith(
      expect.stringMatching(/^training-zones\/videos\/.+\.mp4$/),
      expect.any(Buffer),
      expect.objectContaining({
        contentType: "video/mp4",
      }),
    );
    expect(payload).toEqual({
      url: "https://project.supabase.co/storage/v1/object/public/media/training-zones/videos/file.mp4",
      contentType: "video/mp4",
      bytes: 10,
    });
  });
});
