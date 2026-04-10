import QRCode from "qrcode";
import { QrCode, ShieldCheck } from "lucide-react";
import Link from "next/link";

import PublicInlineAlert from "@/components/public/PublicInlineAlert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  membershipValidationStatusLabels,
  type MembershipValidation,
} from "@/lib/memberships";

interface MembershipQrCardProps {
  memberName: string;
  qrUrl: string;
  validation: MembershipValidation;
  detailHref?: string;
}

export default async function MembershipQrCard({
  memberName,
  qrUrl,
  validation,
  detailHref,
}: Readonly<MembershipQrCardProps>) {
  let qrMarkup: string | null = null;

  try {
    qrMarkup = await QRCode.toString(qrUrl, {
      errorCorrectionLevel: "M",
      margin: 1,
      type: "svg",
      width: 280,
      color: {
        dark: "#111111",
        light: "#ffffff",
      },
    });
  } catch {
    qrMarkup = null;
  }

  const isSuccess = validation.tone === "success";

  return (
    <div className="w-full">
      <div className="border border-black/10 bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-4 border-b border-black/5 pb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#d71920]">
                Estado QR
              </p>
              <h3 className="font-display text-2xl font-black uppercase tracking-tight text-[#111111] italic">
                {memberName}
              </h3>
            </div>
            <Badge
              variant={isSuccess ? "success" : "warning"}
              className="h-7 border-none px-3 text-[9px] font-black uppercase tracking-widest"
            >
              {membershipValidationStatusLabels[validation.status]}
            </Badge>
          </div>
        </div>

        <div className="relative mx-auto mt-8 flex aspect-square w-full max-w-[280px] items-center justify-center bg-white p-4 shadow-[0_0_50px_-12px_rgba(215,25,32,0.15)] transition-all sm:p-6">
          {qrMarkup ? (
            <div className="w-full" dangerouslySetInnerHTML={{ __html: qrMarkup }} />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-black/[0.02] p-6 text-center">
              <QrCode className="h-12 w-12 text-black/10" />
              <PublicInlineAlert
                tone="warning"
                title="Error"
                message="No se pudo generar el QR."
                compact
              />
            </div>
          )}

          <div className="absolute -left-1 -top-1 h-4 w-4 border-l-2 border-t-2 border-[#d71920]" />
          <div className="absolute -right-1 -top-1 h-4 w-4 border-r-2 border-t-2 border-[#d71920]" />
          <div className="absolute -bottom-1 -left-1 h-4 w-4 border-b-2 border-l-2 border-[#d71920]" />
          <div className="absolute -right-1 -bottom-1 h-4 w-4 border-b-2 border-r-2 border-[#d71920]" />
        </div>

        <div className="mt-10 space-y-4">
          <div className="flex items-start gap-3 bg-black/[0.03] p-4 text-[11px] leading-relaxed text-[#5f6368]">
            <ShieldCheck className="h-4 w-4 shrink-0 text-[#d71920]" />
            <p className="uppercase tracking-tight font-medium">
              Este QR abre tu estado publico de membresia. En recepcion el equipo valida el ingreso
              desde su panel.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <Button asChild className="h-12 bg-[#111111] text-white hover:bg-[#d71920]">
              <Link href={qrUrl} target="_blank" rel="noreferrer">
                Abrir estado QR
              </Link>
            </Button>
            {detailHref && (
              <Button
                asChild
                variant="outline"
                className="h-12 border-black/10 text-[#111111] hover:bg-black hover:text-white"
              >
                <Link href={detailHref}>Gestionar Plan</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
