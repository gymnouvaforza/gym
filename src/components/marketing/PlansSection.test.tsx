// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { vi } from "vitest";

import PlansSection from "@/components/marketing/PlansSection";
import { defaultMarketingPlans } from "@/lib/data/marketing-content";
import { defaultSiteSettings } from "@/lib/data/default-content";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: ComponentProps<"a">) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("PlansSection", () => {
  it("renders plans coming from props instead of static hardcode", () => {
    const plans = [
      {
        ...defaultMarketingPlans[0],
        title: "Plan Test",
        price_label: "S/199",
        billing_label: "/4 semanas",
        features: [{ label: "Zona funcional", included: true }],
      },
    ];

    render(<PlansSection settings={defaultSiteSettings} plans={plans} />);

    expect(screen.getByText("Plan Test")).toBeInTheDocument();
    expect(screen.getByText("S/199")).toBeInTheDocument();
    expect(screen.getByText("/4 semanas")).toBeInTheDocument();
    expect(screen.getByText("Zona funcional")).toBeInTheDocument();
  });
});
