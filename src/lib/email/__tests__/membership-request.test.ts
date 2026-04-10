import { vi } from "vitest";

const membershipEmailMocks = vi.hoisted(() => ({
  qrToString: vi.fn(),
  sendSmtpEmail: vi.fn(),
}));

vi.mock("@/lib/email/smtp", () => ({
  sendSmtpEmail: membershipEmailMocks.sendSmtpEmail,
}));

vi.mock("qrcode", () => ({
  default: {
    toString: membershipEmailMocks.qrToString,
  },
}));

import { sendMembershipRequestEmail } from "@/lib/email/membership-request";
import type { MembershipRequestDetail } from "@/lib/memberships";

function buildRequest(): MembershipRequestDetail {
  return {
    activatedAt: null,
    billingLabel: "Mensual",
    commerce: {
      cartId: null,
      orderId: null,
      productId: null,
      syncError: null,
      syncStatus: "ok",
      syncedAt: null,
      variantId: null,
    },
    createdAt: "2026-04-08T10:00:00.000Z",
    currencyCode: "PEN",
    cycleEndsOn: "2026-05-07",
    cycleStartsOn: "2026-04-08",
    durationDays: 30,
    email: "socio@gym.com",
    emailError: null,
    emailSentAt: null,
    emailStatus: "pending",
    id: "req_01",
    manualPaymentSummary: {
      balanceDue: 120,
      entryCount: 0,
      paidTotal: 0,
      status: "pending",
      updatedAt: null,
    },
    member: {
      branchName: null,
      email: "socio@gym.com",
      fullName: "Socio Titan",
      id: "mem_01",
      memberNumber: "M-001",
      membershipQrToken: "ff6ae4fd-b470-4db1-8d47-711fb01eb0a2",
      phone: null,
      status: "active",
      supabaseUserId: "user_01",
      trainerName: null,
      trainerUserId: null,
      trainingPlanLabel: null,
    },
    notes: null,
    plan: {
      id: "plan_01",
      billing_label: "Mensual",
      created_at: "2026-04-08T10:00:00.000Z",
      currency_code: "PEN",
      description: "Plan mensual",
      duration_days: 30,
      is_active: true,
      is_featured: false,
      medusa_product_id: null,
      medusa_sync_error: null,
      medusa_sync_status: "pending",
      medusa_synced_at: null,
      medusa_variant_id: null,
      notes: null,
      price_amount: 120,
      slug: "mensual",
      sort_order: 1,
      title: "Mensual",
      updated_at: "2026-04-08T10:00:00.000Z",
    },
    planTitleSnapshot: "Mensual",
    priceAmount: 120,
    renewsFromRequestId: null,
    requestNumber: "MEM-20260408-ABC123",
    source: "member-portal",
    status: "requested",
    supabaseUserId: "user_01",
    updatedAt: "2026-04-08T10:00:00.000Z",
    validation: {
      cycleEndsOn: "2026-05-07",
      cycleStartsOn: "2026-04-08",
      label: "Pago o activacion pendiente",
      status: "pendiente",
      tone: "default",
    },
  };
}

describe("sendMembershipRequestEmail", () => {
  beforeEach(() => {
    membershipEmailMocks.qrToString.mockReset();
    membershipEmailMocks.sendSmtpEmail.mockReset();
  });

  it("sends the membership email with QR access", async () => {
    membershipEmailMocks.qrToString.mockResolvedValue("<svg>qr</svg>");
    membershipEmailMocks.sendSmtpEmail.mockResolvedValue({ id: "smtp_mem_01" });

    await sendMembershipRequestEmail({
      internalRecipient: "admin@gym.com",
      request: buildRequest(),
      siteName: "Nuova Forza",
      fromEmail: "Nuova Forza <club@gym.com>",
      replyTo: "soporte@gym.com",
    });

    expect(membershipEmailMocks.qrToString).toHaveBeenCalled();
    expect(membershipEmailMocks.sendSmtpEmail).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        to: "socio@gym.com",
        from: "Nuova Forza <club@gym.com>",
        replyTo: "soporte@gym.com",
        subject: "Nuova Forza | Membresia MEM-20260408-ABC123",
        html: expect.stringContaining("<svg>qr</svg>"),
        text: expect.stringContaining("QR:"),
      }),
    );
    expect(membershipEmailMocks.sendSmtpEmail).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        to: "admin@gym.com",
        subject: "Nuova Forza | Nueva membresia MEM-20260408-ABC123",
        text: expect.stringContaining("Nueva membresia"),
      }),
    );
  });
});
