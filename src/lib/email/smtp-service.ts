import nodemailer from "nodemailer";
import { getSmtpEnv } from "@/lib/env";

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

  const transporter = nodemailer.createTransport({
    host: smtpEnv.host,
    port: smtpEnv.port,
    secure: smtpEnv.secure,
    auth: {
      user: smtpEnv.user,
      pass: smtpEnv.password,
    },
  });

  const mailOptions = {
    from: `"Nova Forza Gym" <${smtpEnv.fromEmail}>`,
    to,
    subject: "Confirmación de Pago - Nova Forza Gym",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #d71920;">¡Hola ${memberName}!</h2>
        <p>Hemos registrado tu pago satisfactoriamente.</p>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Monto:</strong> S/ ${amount.toFixed(2)}</p>
          <p><strong>Referencia:</strong> ${reference}</p>
          <p><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        <p>Gracias por ser parte de la familia Nova Forza.</p>
        <hr style="border: 0; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #777;">Este es un correo automático, por favor no respondas.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}
