import QRCode from "qrcode";

import { buildMembershipValidationUrl } from "@/lib/data/memberships";
import { normalizeMembershipQrToken } from "@/lib/membership-qr";
import {
  membershipManualPaymentStatusLabels,
  membershipRequestStatusLabels,
  membershipValidationStatusLabels,
  type MembershipRequestDetail,
} from "@/lib/memberships";
import { resolveCanonicalUrl } from "@/lib/seo";

import { sendSmtpEmail } from "./smtp";

interface MembershipRequestEmailContext {
  fromEmail?: string | null;
  internalRecipient?: string | null;
  replyTo?: string | null;
  request: MembershipRequestDetail;
  siteName: string;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDate(value: string | null) {
  if (!value) {
    return "Pendiente";
  }

  try {
    return new Intl.DateTimeFormat("es-ES", {
      dateStyle: "medium",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

async function buildQrMarkup(qrUrl: string) {
  try {
    return await QRCode.toString(qrUrl, {
      errorCorrectionLevel: "M",
      margin: 1,
      type: "svg",
      width: 180,
    });
  } catch {
    return null;
  }
}

export async function sendMembershipRequestEmail({
  fromEmail,
  internalRecipient,
  replyTo,
  request,
  siteName,
}: MembershipRequestEmailContext) {
  const detailUrl = resolveCanonicalUrl(`/mi-cuenta/membresias/${request.id}`);
  const qrToken = normalizeMembershipQrToken(request.member.membershipQrToken);
  const qrUrl = qrToken ? buildMembershipValidationUrl(qrToken) : null;
  const qrMarkup = qrUrl ? await buildQrMarkup(qrUrl) : null;
  const customerSubject = `${siteName} | Membresia ${request.requestNumber}`;
  const internalSubject = `${siteName} | Nueva membresia ${request.requestNumber}`;
  const customerText = [
    `${siteName} - Membresia ${request.requestNumber}`,
    `Plan: ${request.planTitleSnapshot}`,
    `Estado: ${membershipRequestStatusLabels[request.status]}`,
    `Pago manual: ${membershipManualPaymentStatusLabels[request.manualPaymentSummary.status]}`,
    `Validacion: ${membershipValidationStatusLabels[request.validation.status]}`,
    `Vigencia: ${formatDate(request.cycleStartsOn)} - ${formatDate(request.cycleEndsOn)}`,
    "",
    `Detalle: ${detailUrl}`,
    qrUrl ? `QR: ${qrUrl}` : "QR: pendiente de regeneracion",
  ].join("\n");
  const internalText = [
    `${siteName} - Nueva membresia ${request.requestNumber}`,
    `Socio: ${request.member.fullName}`,
    `Email: ${request.email}`,
    `Plan: ${request.planTitleSnapshot}`,
    `Fuente: ${request.source}`,
    "",
    `Detalle admin/portal: ${detailUrl}`,
    qrUrl ? `QR: ${qrUrl}` : "QR: pendiente de regeneracion",
  ].join("\n");

  await sendSmtpEmail({
    to: request.email,
    from: fromEmail ?? undefined,
    replyTo: replyTo ?? undefined,
    subject: customerSubject,
    html: `
      <div style="margin:0;padding:32px;background:#f5f5f0;font-family:Arial,sans-serif;color:#111111;">
        <div style="max-width:720px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;">
          <div style="padding:32px;border-bottom:4px solid #d71920;">
            <div style="font-size:12px;letter-spacing:0.24em;text-transform:uppercase;font-weight:700;color:#d71920;">${escapeHtml(siteName)}</div>
            <h1 style="margin:14px 0 0;font-size:32px;line-height:1.1;">Tu membresia ya quedo registrada</h1>
            <p style="margin:16px 0 0;color:#4b5563;line-height:1.8;">
              Hemos abierto la solicitud <strong>${escapeHtml(request.requestNumber)}</strong>
              para el plan <strong>${escapeHtml(request.planTitleSnapshot)}</strong>.
            </p>
          </div>

          <div style="padding:32px;">
            <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;">
              <div style="padding:16px;border:1px solid #e5e7eb;background:#fbfbf8;">
                <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-weight:700;color:#6b7280;">Plan</div>
                <div style="margin-top:8px;font-size:18px;font-weight:700;">${escapeHtml(request.planTitleSnapshot)}</div>
              </div>
              <div style="padding:16px;border:1px solid #e5e7eb;background:#fbfbf8;">
                <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-weight:700;color:#6b7280;">Estado</div>
                <div style="margin-top:8px;font-size:18px;font-weight:700;">${escapeHtml(membershipRequestStatusLabels[request.status])}</div>
              </div>
              <div style="padding:16px;border:1px solid #e5e7eb;background:#fbfbf8;">
                <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-weight:700;color:#6b7280;">Pago manual</div>
                <div style="margin-top:8px;font-size:18px;font-weight:700;">${escapeHtml(membershipManualPaymentStatusLabels[request.manualPaymentSummary.status])}</div>
              </div>
              <div style="padding:16px;border:1px solid #e5e7eb;background:#fbfbf8;">
                <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-weight:700;color:#6b7280;">Vigencia</div>
                <div style="margin-top:8px;font-size:16px;font-weight:700;">${escapeHtml(formatDate(request.cycleStartsOn))} · ${escapeHtml(formatDate(request.cycleEndsOn))}</div>
              </div>
            </div>

            <div style="margin-top:24px;padding:18px;border:1px solid #e5e7eb;background:#fbfbf8;">
              <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-weight:700;color:#6b7280;">Validacion</div>
              <div style="margin-top:8px;font-size:18px;font-weight:700;">${escapeHtml(membershipValidationStatusLabels[request.validation.status])}</div>
              <p style="margin:10px 0 0;color:#4b5563;line-height:1.8;">
                Este QR abre una pagina publica con el estado actual de tu membresia. En recepcion,
                el equipo confirma el ingreso desde su panel interno.
              </p>
            </div>

            ${
              qrMarkup
                ? `
                  <div style="margin-top:28px;text-align:center;">
                    <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-weight:700;color:#6b7280;">Tu QR operativo</div>
                    <div style="margin-top:12px;display:inline-block;padding:16px;border:1px solid #e5e7eb;background:#ffffff;">
                      ${qrMarkup}
                    </div>
                  </div>
                `
                : ""
            }

            <div style="margin-top:28px;">
              <a href="${detailUrl}" style="display:inline-block;background:#111111;color:#ffffff;text-decoration:none;padding:12px 18px;font-weight:700;">
                Abrir mi membresia
              </a>
              ${
                qrUrl
                  ? `<a href="${qrUrl}" style="display:inline-block;margin-left:12px;border:1px solid #111111;color:#111111;text-decoration:none;padding:12px 18px;font-weight:700;">
                Abrir estado QR
              </a>`
                  : ""
              }
            </div>
          </div>
        </div>
      </div>
    `,
    text: customerText,
  });

  if (internalRecipient && internalRecipient !== request.email) {
    try {
      await sendSmtpEmail({
        to: internalRecipient,
        from: fromEmail ?? undefined,
        replyTo: replyTo ?? undefined,
        subject: internalSubject,
        html: `
          <div style="margin:0;padding:32px;background:#f5f5f0;font-family:Arial,sans-serif;color:#111111;">
            <div style="max-width:720px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;">
              <div style="padding:32px;border-bottom:4px solid #d71920;">
                <div style="font-size:12px;letter-spacing:0.24em;text-transform:uppercase;font-weight:700;color:#d71920;">${escapeHtml(siteName)}</div>
                <h1 style="margin:14px 0 0;font-size:32px;line-height:1.1;">Nueva solicitud de membresia</h1>
                <p style="margin:16px 0 0;color:#4b5563;line-height:1.8;">
                  Se ha registrado una nueva solicitud para <strong>${escapeHtml(request.member.fullName)}</strong>.
                </p>
              </div>
              <div style="padding:32px;">
                <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;">
                  <div style="padding:16px;border:1px solid #e5e7eb;background:#fbfbf8;">
                    <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-weight:700;color:#6b7280;">Solicitud</div>
                    <div style="margin-top:8px;font-size:18px;font-weight:700;">${escapeHtml(request.requestNumber)}</div>
                  </div>
                  <div style="padding:16px;border:1px solid #e5e7eb;background:#fbfbf8;">
                    <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-weight:700;color:#6b7280;">Plan</div>
                    <div style="margin-top:8px;font-size:18px;font-weight:700;">${escapeHtml(request.planTitleSnapshot)}</div>
                  </div>
                  <div style="padding:16px;border:1px solid #e5e7eb;background:#fbfbf8;">
                    <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-weight:700;color:#6b7280;">Socio</div>
                    <div style="margin-top:8px;font-size:18px;font-weight:700;">${escapeHtml(request.member.fullName)}</div>
                  </div>
                  <div style="padding:16px;border:1px solid #e5e7eb;background:#fbfbf8;">
                    <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-weight:700;color:#6b7280;">Email</div>
                    <div style="margin-top:8px;font-size:18px;font-weight:700;">${escapeHtml(request.email)}</div>
                  </div>
                </div>
                <div style="margin-top:24px;">
                  <a href="${detailUrl}" style="display:inline-block;background:#111111;color:#ffffff;text-decoration:none;padding:12px 18px;font-weight:700;">
                    Abrir detalle
                  </a>
                </div>
              </div>
            </div>
          </div>
        `,
        text: internalText,
      });
    } catch (error) {
      console.warn(
        "[Membership Request Email] El email interno no pudo enviarse:",
        error instanceof Error ? error.message : String(error),
      );
    }
  }
}
