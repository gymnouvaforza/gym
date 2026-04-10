import sharp from "sharp";

import { describe, expect, it } from "vitest";

import { optimizeImage } from "@/lib/media/optimize-image";

describe("optimizeImage", () => {
  it("keeps alpha images as webp", async () => {
    const buffer = await sharp({
      create: {
        width: 120,
        height: 80,
        channels: 4,
        background: { r: 215, g: 25, b: 32, alpha: 0.5 },
      },
    })
      .png()
      .toBuffer();

    const result = await optimizeImage({
      buffer,
      contentType: "image/png",
    });

    expect(result.contentType).toBe("image/webp");
    expect(result.extension).toBe("webp");
    expect(result.width).toBe(120);
    expect(result.height).toBe(80);
  });

  it("converts opaque images to progressive jpeg", async () => {
    const buffer = await sharp({
      create: {
        width: 180,
        height: 120,
        channels: 3,
        background: { r: 17, g: 17, b: 17 },
      },
    })
      .png()
      .toBuffer();

    const result = await optimizeImage({
      buffer,
      contentType: "image/png",
    });

    expect(result.contentType).toBe("image/jpeg");
    expect(result.extension).toBe("jpg");
    expect(result.width).toBe(180);
    expect(result.height).toBe(120);
  });

  it("resizes images when they exceed the maximum dimension", async () => {
    const buffer = await sharp({
      create: {
        width: 5000,
        height: 3000,
        channels: 3,
        background: { r: 255, g: 255, b: 255 },
      },
    })
      .jpeg()
      .toBuffer();

    const result = await optimizeImage({
      buffer,
      contentType: "image/jpeg",
    });

    expect(Math.max(result.width, result.height)).toBe(2400);
  });

  it("rejects unsupported mime types", async () => {
    await expect(
      optimizeImage({
        buffer: Buffer.from("hello world"),
        contentType: "image/gif",
      }),
    ).rejects.toThrow("Solo se admiten imagenes JPEG, PNG o WEBP.");
  });
});
