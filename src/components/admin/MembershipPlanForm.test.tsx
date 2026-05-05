// @vitest-environment jsdom

// Verifies dashboard membership plan form interactions and freeze-day validation.
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import MembershipPlanForm from "@/components/admin/MembershipPlanForm";

const membershipPlanFormMocks = vi.hoisted(() => ({
  saveMembershipPlan: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("@/app/(admin)/dashboard/membresias/planes/actions", () => ({
  saveMembershipPlan: (...args: unknown[]) => membershipPlanFormMocks.saveMembershipPlan(...args),
}));

vi.mock("sonner", () => ({
  toast: {
    error: (...args: unknown[]) => membershipPlanFormMocks.toastError(...args),
    success: (...args: unknown[]) => membershipPlanFormMocks.toastSuccess(...args),
  },
}));

function getInput(container: HTMLElement, name: string) {
  const input = container.querySelector(`input[name="${name}"]`);
  expect(input).toBeInstanceOf(HTMLInputElement);
  return input as HTMLInputElement;
}

describe("MembershipPlanForm", () => {
  beforeEach(() => {
    membershipPlanFormMocks.saveMembershipPlan.mockReset();
    membershipPlanFormMocks.toastError.mockReset();
    membershipPlanFormMocks.toastSuccess.mockReset();
  });

  it("only shows max freeze days when the freezable toggle is enabled", async () => {
    const user = userEvent.setup();

    render(<MembershipPlanForm />);

    expect(screen.queryByTestId("max-freeze-days-field")).not.toBeInTheDocument();

    await user.click(screen.getByRole("checkbox", { name: /permite congelamiento/i }));

    expect(screen.getByTestId("max-freeze-days-field")).toBeInTheDocument();

    await user.click(screen.getByRole("checkbox", { name: /permite congelamiento/i }));

    expect(screen.queryByTestId("max-freeze-days-field")).not.toBeInTheDocument();
  });

  it("submits normalized numeric membership plan values", async () => {
    membershipPlanFormMocks.saveMembershipPlan.mockResolvedValue("plan-1");
    const user = userEvent.setup();
    const { container } = render(<MembershipPlanForm />);

    await user.type(getInput(container, "code"), "PM-3M");
    await user.type(getInput(container, "title"), "Plan Trimestral");
    await user.type(screen.getByRole("textbox", { name: /descripcion/i }), "Acceso completo");
    await user.clear(getInput(container, "price_amount"));
    await user.type(getInput(container, "price_amount"), "249.90");
    await user.clear(getInput(container, "duration_days"));
    await user.type(getInput(container, "duration_days"), "90");
    await user.clear(getInput(container, "bonus_days"));
    await user.type(getInput(container, "bonus_days"), "5");
    await user.click(screen.getByRole("checkbox", { name: /permite congelamiento/i }));
    await user.clear(getInput(container, "max_freeze_days"));
    await user.type(getInput(container, "max_freeze_days"), "15");
    await user.click(screen.getByRole("button", { name: /guardar plan/i }));

    await waitFor(() => {
      expect(membershipPlanFormMocks.saveMembershipPlan).toHaveBeenCalledWith(
        expect.objectContaining({
          bonus_days: 5,
          code: "PM-3M",
          description: "Acceso completo",
          duration_days: 90,
          is_freezable: true,
          max_freeze_days: 15,
          price_amount: 249.9,
          title: "Plan Trimestral",
        }),
        undefined,
      );
    });
  });
});
