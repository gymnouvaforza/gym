// @vitest-environment jsdom

import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import MemberProgressTab from "./MemberProgressTab";

vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: ComponentProps<"div">) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: ComponentProps<"span">) => <span {...props}>{children}</span>,
  },
}));

vi.mock("recharts", () => ({
  CartesianGrid: () => null,
  Legend: () => null,
  Line: () => null,
  LineChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Tooltip: () => null,
  XAxis: () => null,
  YAxis: () => null,
}));

describe("MemberProgressTab", () => {
  it("renders empty measurements state and disabled registration button", () => {
    render(<MemberProgressTab measurements={[]} memberId="member-1" />);

    expect(screen.getByRole("button", { name: /Registro No Disponible/i })).toBeDisabled();
    expect(screen.getByText("No hay medidas registradas.")).toBeInTheDocument();
  });

  it("renders latest perimeter values when measurements exist", () => {
    render(
      <MemberProgressTab
        memberId="member-1"
        measurements={[
          {
            id: "measure-1",
            weight: 80,
            fatPercentage: 14,
            perimeters: {
              waist: 82,
              chest: 102,
              arm: 36,
            },
            recordedAt: "2026-04-21",
          },
        ]}
      />,
    );

    expect(screen.getByText("82 cm")).toBeInTheDocument();
    expect(screen.getByText("102 cm")).toBeInTheDocument();
    expect(screen.getByText("36 cm")).toBeInTheDocument();
  });
});
