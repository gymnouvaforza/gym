// @vitest-environment jsdom

import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";

import ImageUpload from "@/components/admin/ImageUpload";

const uploadAdminMediaMock = vi.fn();

vi.mock("@/lib/media/admin-upload", () => ({
  uploadAdminMedia: (...args: unknown[]) => uploadAdminMediaMock(...args),
}));

vi.mock("next/image", () => ({
  default: ({ alt }: ComponentProps<"img"> & { fill?: boolean }) => (
    <div data-testid="mock-image" data-alt={alt} />
  ),
}));

describe("ImageUpload", () => {
  it("uploads product images through the admin media API helper", async () => {
    uploadAdminMediaMock.mockResolvedValue({
      url: "https://cdn.example.com/products/whey.webp",
      contentType: "image/webp",
      width: 1200,
      height: 1200,
      bytes: 120000,
    });

    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<ImageUpload value={[]} onChange={onChange} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File([new Uint8Array([1, 2, 3])], "whey.png", { type: "image/png" });

    await user.upload(input, file);

    await waitFor(() => {
      expect(uploadAdminMediaMock).toHaveBeenCalledWith(file, "product");
    });
    expect(onChange).toHaveBeenCalledWith(["https://cdn.example.com/products/whey.webp"]);
  });
});
