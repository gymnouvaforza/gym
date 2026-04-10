// @vitest-environment jsdom

import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";

import MarketingTeamImageUpload from "@/components/admin/MarketingTeamImageUpload";

const uploadAdminMediaMock = vi.fn();

vi.mock("@/lib/media/admin-upload", () => ({
  uploadAdminMedia: (...args: unknown[]) => uploadAdminMediaMock(...args),
}));

vi.mock("next/image", () => ({
  default: ({ alt }: ComponentProps<"img"> & { fill?: boolean }) => (
    <div data-testid="mock-image" data-alt={alt} />
  ),
}));

describe("MarketingTeamImageUpload", () => {
  it("uploads team images through the admin media API helper", async () => {
    uploadAdminMediaMock.mockResolvedValue({
      url: "https://cdn.example.com/team/coach.webp",
      contentType: "image/webp",
      width: 900,
      height: 1200,
      bytes: 90000,
    });

    const user = userEvent.setup();
    const onChange = vi.fn();

    const { container } = render(
      <MarketingTeamImageUpload value="" onChange={onChange} />,
    );

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File([new Uint8Array([4, 5, 6])], "coach.png", { type: "image/png" });

    await user.upload(input, file);

    await waitFor(() => {
      expect(uploadAdminMediaMock).toHaveBeenCalledWith(file, "team");
    });
    expect(onChange).toHaveBeenCalledWith("https://cdn.example.com/team/coach.webp");
  });
});
