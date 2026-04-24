import { beforeEach, describe, expect, it, vi } from "vitest";

const smtpServiceMocks = vi.hoisted(() => ({
  getSmtpEnv: vi.fn(),
  getMarketingData: vi.fn(),
  sendSmtpEmail: vi.fn(),
}));

vi.mock("@/lib/env", () => ({
  getSmtpEnv: smtpServiceMocks.getSmtpEnv,
}));

vi.mock("@/lib/data/site", () => ({
  getMarketingData: smtpServiceMocks.getMarketingData,
}));

vi.mock("@/lib/email/smtp", () => ({
  sendSmtpEmail: smtpServiceMocks.sendSmtpEmail,
}));

import { sendPaymentConfirmationEmail } from "@/lib/email/smtp-service";

describe("sendPaymentConfirmationEmail", () => {
  beforeEach(() => {
    smtpServiceMocks.getSmtpEnv.mockReset();
    smtpServiceMocks.getMarketingData.mockReset();
    smtpServiceMocks.sendSmtpEmail.mockReset();

    smtpServiceMocks.getSmtpEnv.mockReturnValue({
      host: "mail.nuovaforzagym.com",
      port: 587,
      secure: false,
      user: "info@nuovaforzagym.com",
      password: "secret",
      fromEmail: "Nuova Forza <info@nuovaforzagym.com>",
    });
    smtpServiceMocks.getMarketingData.mockResolvedValue({
      settings: {
        site_name: "Nuova Forza",
        contact_email: "info@nuovaforzagym.com",
        notification_email: "info@nuovaforzagym.com",
        transactional_from_email: "info@nuovaforzagym.com",
      },
    });
    smtpServiceMocks.sendSmtpEmail.mockResolvedValue({ id: "smtp_pay_01" });
  });

  it("uses normalized SMTP sender without nesting angle brackets", async () => {
    await sendPaymentConfirmationEmail({
      to: "socio@gym.com",
      memberName: "Socio Test",
      amount: 20.5,
      reference: "RC-1",
    });

    expect(smtpServiceMocks.sendSmtpEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "Nuova Forza <info@nuovaforzagym.com>",
        to: "socio@gym.com",
        replyTo: "info@nuovaforzagym.com",
        subject: "Confirmacion de pago - Nuova Forza",
        text: expect.stringContaining("Monto: S/ 20.50"),
      }),
    );
  });
});
