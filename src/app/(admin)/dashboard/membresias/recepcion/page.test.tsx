// @vitest-environment jsdom

import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const receptionPageMocks = vi.hoisted(() => ({
  requireAdminUser: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAdminUser: receptionPageMocks.requireAdminUser,
}));

vi.mock("@/components/admin/MembershipReceptionWorkspace", () => ({
  default: () => <div data-testid="membership-reception-workspace" />,
}));

vi.mock("@/components/admin/MembershipOpsSubnav", () => ({
  default: () => <div data-testid="membership-ops-subnav" />,
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: ComponentProps<"a">) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("dashboard membership reception page", () => {
  beforeEach(() => {
    receptionPageMocks.requireAdminUser.mockResolvedValue({
      id: "admin_1",
      email: "admin@test",
    });
  });

  it("renders the camera-first reception workspace for authenticated staff", async () => {
    const Page = (await import("./page")).default;

    render(await Page());

    expect(screen.getByText("RECEPCION QR")).toBeInTheDocument();
    expect(screen.getByTestId("membership-ops-subnav")).toBeInTheDocument();
    expect(screen.getByTestId("membership-reception-workspace")).toBeInTheDocument();
  });
});
