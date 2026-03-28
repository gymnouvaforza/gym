import { beforeEach, describe, expect, it, vi } from "vitest";

const smtpMocks = vi.hoisted(() => ({
  getSmtpEnv: vi.fn(),
  createTransport: vi.fn(),
  sendMail: vi.fn(),
}));

vi.mock("@/lib/env", () => ({
  getSmtpEnv: smtpMocks.getSmtpEnv,
}));

vi.mock("nodemailer", () => ({
  default: {
    createTransport: smtpMocks.createTransport,
  },
  createTransport: smtpMocks.createTransport,
}));

import { sendSmtpEmail } from "@/lib/email/smtp";

describe("sendSmtpEmail", () => {
  beforeEach(() => {
    smtpMocks.getSmtpEnv.mockReset();
    smtpMocks.createTransport.mockReset();
    smtpMocks.sendMail.mockReset();

    smtpMocks.getSmtpEnv.mockReturnValue({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      user: "club@gmail.com",
      password: "app-password",
      fromEmail: "Nova Forza <club@gmail.com>",
    });
    smtpMocks.createTransport.mockReturnValue({
      sendMail: smtpMocks.sendMail,
    });
  });

  it("sends email through nodemailer with normalized recipients", async () => {
    smtpMocks.sendMail.mockResolvedValue({
      messageId: "smtp_message_01",
    });

    await expect(
      sendSmtpEmail({
        to: "member@gym.com",
        subject: "Pedido listo",
        html: "<p>Hola</p>",
        text: "Hola",
        replyTo: "pedidos@novaforza.pe",
      }),
    ).resolves.toEqual({
      id: "smtp_message_01",
    });

    expect(smtpMocks.createTransport).toHaveBeenCalledWith({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "club@gmail.com",
        pass: "app-password",
      },
    });
    expect(smtpMocks.sendMail).toHaveBeenCalledWith({
      from: "Nova Forza <club@gmail.com>",
      to: ["member@gym.com"],
      replyTo: ["pedidos@novaforza.pe"],
      subject: "Pedido listo",
      html: "<p>Hola</p>",
      text: "Hola",
    });
  });

  it("allows overriding the sender per message", async () => {
    smtpMocks.sendMail.mockResolvedValue({
      messageId: "smtp_message_02",
    });

    await sendSmtpEmail({
      to: ["member@gym.com", "club@novaforza.pe"],
      from: "Nova Forza <pedidos@novaforza.pe>",
      subject: "Pedido listo",
      html: "<p>Hola</p>",
      text: "Hola",
    });

    expect(smtpMocks.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "Nova Forza <pedidos@novaforza.pe>",
        to: ["member@gym.com", "club@novaforza.pe"],
      }),
    );
  });

  it("surfaces a useful SMTP error message", async () => {
    smtpMocks.sendMail.mockRejectedValue({
      code: "EAUTH",
      responseCode: 535,
      response: "Authentication failed",
      message: "Invalid login",
    });

    await expect(
      sendSmtpEmail({
        to: "member@gym.com",
        subject: "Pedido listo",
        html: "<p>Hola</p>",
        text: "Hola",
      }),
    ).rejects.toThrow(
      "SMTP no pudo enviar el email: EAUTH | code 535 | Authentication failed | Invalid login",
    );
  });
});
