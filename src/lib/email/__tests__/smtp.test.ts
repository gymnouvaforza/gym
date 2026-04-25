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
      fromEmail: "Nuova Forza <club@gmail.com>",
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
      from: "Nuova Forza <club@gmail.com>",
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
      from: "Nuova Forza <pedidos@novaforza.pe>",
      subject: "Pedido listo",
      html: "<p>Hola</p>",
      text: "Hola",
    });

    expect(smtpMocks.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "Nuova Forza <pedidos@novaforza.pe>",
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
    ).rejects.toThrow(/SMTP rechazo autenticacion para club@gmail.com en smtp\.gmail\.com:587\./);

    expect(smtpMocks.createTransport).toHaveBeenCalledTimes(1);
    expect(smtpMocks.sendMail).toHaveBeenCalledTimes(1);
  });

  it("retries transient SMTP errors before failing", async () => {
    smtpMocks.sendMail
      .mockRejectedValueOnce({
        code: "ETIMEDOUT",
        responseCode: 421,
        response: "Temporary timeout",
        message: "socket timeout",
      })
      .mockRejectedValueOnce({
        code: "ECONNECTION",
        responseCode: 421,
        response: "Temporary connection issue",
        message: "Connection lost",
      })
      .mockResolvedValueOnce({
        messageId: "smtp_message_03",
      });

    await expect(
      sendSmtpEmail({
        to: "member@gym.com",
        subject: "Pedido listo",
        html: "<p>Hola</p>",
        text: "Hola",
      }),
    ).resolves.toEqual({
      id: "smtp_message_03",
    });

    expect(smtpMocks.createTransport).toHaveBeenCalledTimes(3);
    expect(smtpMocks.sendMail).toHaveBeenCalledTimes(3);
  });
});
