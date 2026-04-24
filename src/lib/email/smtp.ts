import nodemailer from "nodemailer";

import { getSmtpEnv } from "@/lib/env";

interface SendSmtpEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  from?: string;
  replyTo?: string | string[] | null;
}

function normalizeRecipients(value: string | string[]) {
  return Array.isArray(value) ? value : [value];
}

function normalizeReplyTo(value: string | string[] | null | undefined) {
  if (!value) {
    return undefined;
  }

  return Array.isArray(value) ? value : [value];
}

function formatSmtpError(
  error: unknown,
  smtp: {
    host: string;
    port: number;
    user: string;
  },
) {
  if (!error || typeof error !== "object") {
    return "SMTP no pudo enviar el email.";
  }

  const smtpError = error as Partial<Error> & {
    code?: string;
    response?: string;
    responseCode?: number;
    message?: string;
  };

  const details = [
    smtpError.code,
    typeof smtpError.responseCode === "number" ? `code ${smtpError.responseCode}` : null,
    smtpError.response,
    smtpError.message,
  ].filter(Boolean);

  if (details.length === 0) {
    return "SMTP no pudo enviar el email.";
  }

  if (smtpError.code === "EAUTH" || smtpError.responseCode === 535) {
    return [
      `SMTP rechazo autenticacion para ${smtp.user} en ${smtp.host}:${smtp.port}.`,
      "Revisa SMTP_USER y SMTP_PASSWORD del buzón en entorno/hosting.",
      `Detalle: ${details.join(" | ")}`,
    ].join(" ");
  }

  return `SMTP no pudo enviar el email: ${details.join(" | ")}`;
}

export async function sendSmtpEmail(input: SendSmtpEmailInput) {
  const smtp = getSmtpEnv();
  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: {
      user: smtp.user,
      pass: smtp.password,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: input.from ?? smtp.fromEmail,
      to: normalizeRecipients(input.to),
      replyTo: normalizeReplyTo(input.replyTo),
      subject: input.subject,
      html: input.html,
      text: input.text,
    });

    return {
      id: info.messageId,
    };
  } catch (error) {
    throw new Error(formatSmtpError(error, smtp));
  }
}
