import { defaultSiteSettings } from "@/lib/data/default-content";
import { getMarketingData } from "@/lib/data/site";
import { getSmtpEnv } from "@/lib/env";

import { resolveTransactionalSender } from "./policy";
import { sendSmtpEmail } from "./smtp";

/**
 * Servicio SMTP para Nova Forza Gym
 * Encargado de confirmaciones de pago y membresias.
 */

export async function sendPaymentConfirmationEmail({
  to,
  memberName,
  amount,
  reference,
}: {
  to: string;
  memberName: string;
  amount: number;
  reference: string;
}) {
  const smtpEnv = getSmtpEnv();
  const { settings } = await getMarketingData().catch(() => ({
    settings: defaultSiteSettings,
  }));
  const siteName = settings.site_name ?? defaultSiteSettings.site_name;
  const sender = resolveTransactionalSender(
    siteName,
    settings.transactional_from_email ?? defaultSiteSettings.transactional_from_email,
    smtpEnv.fromEmail,
    [smtpEnv.user],
  );

  await sendSmtpEmail({
    to,
    from: sender.fromEmail,
    replyTo: sender.replyTo ?? settings.contact_email ?? defaultSiteSettings.contact_email,
    subject: `Confirmacion de pago - ${siteName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #d71920;">Hola ${memberName}</h2>
        <p>Hemos registrado tu pago satisfactoriamente.</p>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Monto:</strong> S/ ${amount.toFixed(2)}</p>
          <p><strong>Referencia:</strong> ${reference}</p>
          <p><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        <p>Gracias por ser parte de ${siteName}.</p>
        <hr style="border: 0; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #777;">Este es un correo automatico, por favor no respondas.</p>
      </div>
    `,
    text: [
      `${siteName} - Confirmacion de pago`,
      `Hola ${memberName},`,
      "",
      "Hemos registrado tu pago satisfactoriamente.",
      `Monto: S/ ${amount.toFixed(2)}`,
      `Referencia: ${reference}`,
      `Fecha: ${new Date().toLocaleDateString()}`,
    ].join("\n"),
  });
}
