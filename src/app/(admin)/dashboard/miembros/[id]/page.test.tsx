// @vitest-environment jsdom

import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const pageMocks = vi.hoisted(() => ({
  getDashboardMemberDetail: vi.fn(),
  listDashboardAuthLinkOptions: vi.fn(),
  listDashboardTrainerOptions: vi.fn(),
  listMembershipPlans: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error("not-found");
  }),
}));

vi.mock("next/navigation", () => ({
  notFound: pageMocks.notFound,
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("@/lib/data/gym-management", () => ({
  getDashboardMemberDetail: pageMocks.getDashboardMemberDetail,
  listDashboardAuthLinkOptions: pageMocks.listDashboardAuthLinkOptions,
  listDashboardTrainerOptions: pageMocks.listDashboardTrainerOptions,
}));

vi.mock("@/lib/data/memberships", () => ({
  listMembershipPlans: pageMocks.listMembershipPlans,
}));

vi.mock("./components/MemberProfileTab", () => ({
  default: () => <div data-testid="member-profile-tab" />,
}));

vi.mock("./components/MemberFinanceTab", () => ({
  default: () => <div data-testid="member-finance-tab" />,
}));

vi.mock("./components/MemberProgressTab", () => ({
  default: () => <div data-testid="member-progress-tab" />,
}));

vi.mock("./components/MemberTrainingTab", () => ({
  default: () => <div data-testid="member-training-tab" />,
}));

vi.mock("@/components/ui/tabs", () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: React.ReactNode }) => <button type="button">{children}</button>,
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: ComponentProps<"a">) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("dashboard member detail page", () => {
  beforeEach(() => {
    pageMocks.getDashboardMemberDetail.mockReset();
    pageMocks.listDashboardAuthLinkOptions.mockReset();
    pageMocks.listDashboardTrainerOptions.mockReset();
    pageMocks.listMembershipPlans.mockReset();

    pageMocks.listDashboardAuthLinkOptions.mockResolvedValue([]);
    pageMocks.listDashboardTrainerOptions.mockResolvedValue([]);
    pageMocks.listMembershipPlans.mockResolvedValue([]);
  });

  it("composes tabs even when finance and measurements are empty", async () => {
    pageMocks.getDashboardMemberDetail.mockResolvedValue({
      assignmentHistory: [],
      availableTemplates: [],
      linkedUser: null,
      member: {
        id: "member-1",
        memberNumber: "NF-001",
        fullName: "Socio Titan",
        email: "socio@test.com",
        branchName: "Centro",
        phone: null,
        status: "active",
      },
      notes: null,
      plan: null,
      trainingFeedback: {
        exercises: [],
        liked: null,
        note: null,
      },
      statusMeta: {
        helperText: "Activa",
        label: "Activa",
      },
      financials: null,
      measurements: [],
    });

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "member-1" }) }));

    expect(screen.getByText("Socio Titan")).toBeInTheDocument();
    expect(screen.getByTestId("member-profile-tab")).toBeInTheDocument();
    expect(screen.getByText("Deuda Pendiente")).toBeInTheDocument();
    expect(screen.getByText("0.00")).toBeInTheDocument();
    expect(screen.getByText("Vencimiento")).toBeInTheDocument();
    expect(screen.getByTestId("member-training-tab")).toBeInTheDocument();
  });

  it("calls notFound when member detail does not exist", async () => {
    pageMocks.getDashboardMemberDetail.mockResolvedValue(null);

    const Page = (await import("./page")).default;

    await expect(Page({ params: Promise.resolve({ id: "missing" }) })).rejects.toThrow("not-found");
    expect(pageMocks.notFound).toHaveBeenCalledTimes(1);
  });
});
