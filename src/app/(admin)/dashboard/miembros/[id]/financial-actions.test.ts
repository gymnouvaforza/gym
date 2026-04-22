// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";

const actionMocks = vi.hoisted(() => ({
  registerMemberPayment: vi.fn(),
  revalidatePath: vi.fn(),
  requireAdminUser: vi.fn(),
  sendPaymentConfirmationEmail: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: actionMocks.revalidatePath,
}));

vi.mock("@/lib/auth", () => ({
  requireAdminUser: actionMocks.requireAdminUser,
}));

vi.mock("@/lib/data/member-finance", () => ({
  registerMemberPayment: actionMocks.registerMemberPayment,
}));

vi.mock("@/lib/email/smtp-service", () => ({
  sendPaymentConfirmationEmail: actionMocks.sendPaymentConfirmationEmail,
}));

function buildFormData(overrides?: Partial<Record<string, string>>) {
  const formData = new FormData();
  const values = {
    membershipId: "550e8400-e29b-41d4-a716-446655440000",
    amount: "20.50",
    method: "cash",
    reference: "RC-1",
    memberEmail: "socio@test.com",
    memberName: "Socio Test",
    ...overrides,
  };

  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }

  return formData;
}

describe("recordMemberPaymentAction", () => {
  beforeEach(() => {
    vi.resetModules();
    actionMocks.registerMemberPayment.mockReset();
    actionMocks.revalidatePath.mockReset();
    actionMocks.requireAdminUser.mockReset();
    actionMocks.sendPaymentConfirmationEmail.mockReset();
    actionMocks.requireAdminUser.mockResolvedValue({
      id: "admin-1",
      email: "admin@test.com",
    });
  });

  it("returns validation error and skips service when payload is invalid", async () => {
    const { recordMemberPaymentAction } = await import("./financial-actions");
    const result = await recordMemberPaymentAction(buildFormData({ amount: "" }));

    expect(actionMocks.registerMemberPayment).not.toHaveBeenCalled();
    expect(result).toEqual(
      expect.objectContaining({
        error: expect.any(String),
      }),
    );
  });

  it("requires authenticated admin before recording payment", async () => {
    actionMocks.requireAdminUser.mockRejectedValue(new Error("No autorizado"));

    const { recordMemberPaymentAction } = await import("./financial-actions");
    const result = await recordMemberPaymentAction(buildFormData());

    expect(actionMocks.requireAdminUser).toHaveBeenCalledTimes(1);
    expect(actionMocks.registerMemberPayment).not.toHaveBeenCalled();
    expect(result).toEqual({ error: "No autorizado" });
  });

  it("delegates to domain service and revalidates related routes", async () => {
    actionMocks.registerMemberPayment.mockResolvedValue({
      memberId: "member-1",
      membershipId: "membership-1",
      newBalance: 12.5,
      payment: {
        id: "payment-1",
        amountPaid: 20.5,
        paymentMethod: "cash",
        referenceCode: "RC-1",
        recordedAt: "2026-04-22T12:00:00.000Z",
      },
      status: "pending",
    });

    const { recordMemberPaymentAction } = await import("./financial-actions");
    const result = await recordMemberPaymentAction(buildFormData());

    expect(actionMocks.registerMemberPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        membershipId: "550e8400-e29b-41d4-a716-446655440000",
        amount: 20.5,
        method: "cash",
        recordedByUserId: "admin-1",
      }),
    );
    expect(actionMocks.revalidatePath).toHaveBeenCalledWith("/dashboard/miembros");
    expect(actionMocks.revalidatePath).toHaveBeenCalledWith("/dashboard/mobile");
    expect(actionMocks.revalidatePath).toHaveBeenCalledWith("/dashboard/miembros/member-1");
    expect(result).toEqual({
      success: true,
      newBalance: 12.5,
      paymentId: "payment-1",
    });
  });

  it("keeps action successful when confirmation email fails", async () => {
    actionMocks.registerMemberPayment.mockResolvedValue({
      memberId: "member-1",
      membershipId: "membership-1",
      newBalance: 0,
      payment: {
        id: "payment-2",
        amountPaid: 20.5,
        paymentMethod: "cash",
        referenceCode: "RC-1",
        recordedAt: "2026-04-22T12:00:00.000Z",
      },
      status: "active",
    });
    actionMocks.sendPaymentConfirmationEmail.mockRejectedValue(new Error("SMTP off"));

    const { recordMemberPaymentAction } = await import("./financial-actions");
    const result = await recordMemberPaymentAction(buildFormData());

    expect(result).toEqual({
      success: true,
      newBalance: 0,
      paymentId: "payment-2",
    });
  });
});
