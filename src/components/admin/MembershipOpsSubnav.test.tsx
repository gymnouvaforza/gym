// @vitest-environment jsdom

import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import MembershipOpsSubnav from "@/components/admin/MembershipOpsSubnav";

const pathnameMock = vi.hoisted(() => ({ current: "/dashboard/membresias/pedidos" }));

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameMock.current,
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: ComponentProps<"a">) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("MembershipOpsSubnav", () => {
  beforeEach(() => {
    pathnameMock.current = "/dashboard/membresias/pedidos";
  });

  it("marks solicitudes as active on the membership requests route", () => {
    render(<MembershipOpsSubnav />);

    expect(screen.getByRole("link", { name: /solicitudes/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: /escaneo qr/i })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("marks escaneo qr as active on the scanner route", () => {
    pathnameMock.current = "/dashboard/membresias/recepcion";
    render(<MembershipOpsSubnav />);

    expect(screen.getByRole("link", { name: /escaneo qr/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: /solicitudes/i })).not.toHaveAttribute(
      "aria-current",
    );
  });
});
