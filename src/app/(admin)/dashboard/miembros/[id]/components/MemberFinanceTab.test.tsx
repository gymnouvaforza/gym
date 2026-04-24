// @vitest-environment jsdom

import type { ComponentProps } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import MemberFinanceTab from "./MemberFinanceTab";

const financeMocks = vi.hoisted(() => ({
  recordMemberPaymentAction: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: ComponentProps<"div">) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: ComponentProps<"span">) => <span {...props}>{children}</span>,
  },
}));

vi.mock("../financial-actions", () => ({
  recordMemberPaymentAction: (...args: unknown[]) => financeMocks.recordMemberPaymentAction(...args),
}));

vi.mock("sonner", () => ({
  toast: {
    error: (...args: unknown[]) => financeMocks.toastError(...args),
    success: (...args: unknown[]) => financeMocks.toastSuccess(...args),
  },
}));

vi.mock("@/components/admin/MembershipRequestCreateForm", () => ({
  default: () => <div data-testid="membership-request-create-form" />,
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectTrigger: ({ children, ...props }: React.ComponentProps<"button">) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
  SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const baseFinancials = {
  id: "membership-1",
  planTitle: "Plan Pro",
  totalPrice: 120,
  balanceDue: 40,
  status: "pending" as const,
  startDate: "2026-04-01",
  endDate: "2026-04-30",
  payments: [
    {
      id: "payment-1",
      amountPaid: 80,
      paymentMethod: "cash",
      referenceCode: "RC-1",
      recordedAt: "2026-04-12T10:00:00.000Z",
    },
  ],
};

describe("MemberFinanceTab", () => {
  beforeEach(() => {
    financeMocks.recordMemberPaymentAction.mockReset();
    financeMocks.toastError.mockReset();
    financeMocks.toastSuccess.mockReset();
    vi.stubGlobal("open", vi.fn());
  });

  it("renders empty state and still exposes the manual membership request form", () => {
    render(
      <MemberFinanceTab
        financials={null}
        memberId="member-1"
        memberEmail="socio@test.com"
        memberName="Socio Test"
        memberPhone={null}
        membershipPlans={[]}
      />,
    );

    expect(screen.getByText("Sin membresia activa")).toBeInTheDocument();
    expect(screen.getByTestId("membership-request-create-form")).toBeInTheDocument();
  });

  it("renders existing payment history", () => {
    render(
      <MemberFinanceTab
        financials={baseFinancials}
        memberId="member-1"
        memberEmail="socio@test.com"
        memberName="Socio Test"
        memberPhone="999999999"
        membershipPlans={[]}
      />,
    );

    expect(screen.getByText("Plan Pro")).toBeInTheDocument();
    expect(screen.getAllByText("S/ 80.00")).toHaveLength(2);
    expect(screen.getByTestId("membership-request-create-form")).toBeInTheDocument();
  });

  it("adds optimistic payment row while action is pending and disables receipt send", async () => {
    financeMocks.recordMemberPaymentAction.mockImplementation(
      () => new Promise(() => undefined),
    );
    const user = userEvent.setup();

    render(
      <MemberFinanceTab
        financials={baseFinancials}
        memberId="member-1"
        memberEmail="socio@test.com"
        memberName="Socio Test"
        memberPhone="999999999"
        membershipPlans={[]}
      />,
    );

    await user.type(screen.getByLabelText("Monto a Recibir (S/)"), "20");
    await user.click(screen.getByRole("button", { name: /Confirmar Operacion/i }));

    expect(await screen.findAllByText("S/ 20.00")).toHaveLength(2);
    expect(screen.getByRole("button", { name: /Enviar recibo temp-/i })).toBeDisabled();
  });

  it("surfaces action errors through toast", async () => {
    financeMocks.recordMemberPaymentAction.mockResolvedValue({
      error: "Cobro duplicado",
    });
    const user = userEvent.setup();

    render(
      <MemberFinanceTab
        financials={baseFinancials}
        memberId="member-1"
        memberEmail="socio@test.com"
        memberName="Socio Test"
        memberPhone="999999999"
        membershipPlans={[]}
      />,
    );

    await user.type(screen.getByLabelText("Monto a Recibir (S/)"), "10");
    await user.click(screen.getByRole("button", { name: /Confirmar Operacion/i }));

    await waitFor(() => {
      expect(financeMocks.toastError).toHaveBeenCalledWith("Cobro duplicado");
    });
  });
});
