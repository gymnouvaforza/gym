"use client";

import Link from "next/link";
import { QrCode, ShieldCheck, UserRound } from "lucide-react";
import { useState } from "react";

import AdminSection from "@/components/admin/AdminSection";
import AdminSurface from "@/components/admin/AdminSurface";
import MembershipReceptionScanner, {
  type MembershipReceptionScannerState,
} from "@/components/admin/MembershipReceptionScanner";
import { Badge } from "@/components/ui/badge";
import FeedbackCallout, { type FeedbackTone } from "@/components/ui/feedback-callout";
import { Button } from "@/components/ui/button";
import { type MembershipQrValidationResponse } from "@/lib/membership-qr";
import { formatMemberAccountDate } from "@/lib/member-account";
import { membershipRequestStatusLabels } from "@/lib/memberships";

const DEFAULT_SCANNER_STATE: MembershipReceptionScannerState = {
  phase: "idle",
  helperMessage: "Abre la camara del dispositivo para empezar a validar membresias.",
  errorMessage: null,
};

function getResultBadgeVariant(result: MembershipQrValidationResponse) {
  if (result.reasonCode === "ok") {
    return "success" as const;
  }

  if (result.reasonCode === "inactive_membership" || result.reasonCode === "payment_pending") {
    return "warning" as const;
  }

  return "muted" as const;
}

function getResultTone(result: MembershipQrValidationResponse): FeedbackTone {
  if (result.reasonCode === "ok") {
    return "success";
  }

  if (result.reasonCode === "invalid_format" || result.reasonCode === "member_not_found") {
    return "error";
  }

  return result.status === "error" ? "error" : "warning";
}

function getResultTitle(result: MembershipQrValidationResponse) {
  switch (result.reasonCode) {
    case "ok":
      return "Acceso permitido";
    case "invalid_format":
      return "QR no reconocido";
    case "member_not_found":
      return "QR sin socio vinculado";
    case "inactive_membership":
      return "Acceso bloqueado";
    case "expired_membership":
      return "Membresia vencida";
    case "payment_pending":
      return "Pendiente de pago o activacion";
    case "forbidden":
      return "Acceso restringido";
    case "server_error":
    default:
      return "Validacion no disponible";
  }
}

export default function MembershipReceptionWorkspace() {
  const [scannerState, setScannerState] =
    useState<MembershipReceptionScannerState>(DEFAULT_SCANNER_STATE);
  const [validationResult, setValidationResult] = useState<MembershipQrValidationResponse | null>(
    null,
  );

  return (
    <div className="grid gap-8 xl:grid-cols-[440px_minmax(0,1fr)]">
      <AdminSection
        title="Escaner operativo"
        description="Recepcion movil con camara trasera y validacion en vivo contra Supabase. No hay pegado manual ni saltos de ruta."
        icon={QrCode}
      >
        <MembershipReceptionScanner
          onStateChange={setScannerState}
          onValidationResolved={setValidationResult}
        />
      </AdminSection>

      <AdminSection
        title="Resultado de recepcion"
        description="Decision binaria para staff: puede pasar o necesita revision. La ficha y el detalle solo aparecen cuando hay un resultado real."
        icon={ShieldCheck}
      >
        {scannerState.phase === "preparing" || scannerState.phase === "scanning" || scannerState.phase === "validating" ? (
          <FeedbackCallout
            chrome="admin"
            tone="info"
            title={
              scannerState.phase === "validating"
                ? "Validando acceso"
                : scannerState.phase === "scanning"
                  ? "Escaneando en vivo"
                  : "Preparando camara"
            }
            message={
              scannerState.helperMessage ??
              "Estamos preparando el escaneo para validar la membresia."
            }
          />
        ) : !validationResult ? (
          <FeedbackCallout
            chrome="admin"
            tone="info"
            title="Listo para escanear"
            message="Cuando el lector detecte un QR, aqui veras si la membresia funciona o no funciona, con el motivo exacto y accesos rapidos para el equipo."
          />
        ) : validationResult.status === "error" ? (
          <FeedbackCallout
            chrome="admin"
            tone="error"
            title={getResultTitle(validationResult)}
            message={
              validationResult.errorMessage ??
              "La validacion QR no pudo completarse desde este entorno."
            }
          />
        ) : (
          <div className="space-y-6">
            <FeedbackCallout
              chrome="admin"
              tone={getResultTone(validationResult)}
              title={getResultTitle(validationResult)}
              message={validationResult.validationLabel}
            />

            {validationResult.member ? (
              <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                <AdminSurface inset className="border-black/5 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-black/8 pb-4">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#d71920]">
                        Socio detectado
                      </p>
                      <h3 className="text-2xl font-black uppercase tracking-tight text-[#111111]">
                        {validationResult.member.fullName}
                      </h3>
                      <p className="text-[12px] uppercase tracking-[0.18em] text-[#5f6368]">
                        {validationResult.member.memberNumber}
                      </p>
                    </div>
                    <Badge variant={getResultBadgeVariant(validationResult)}>
                      {validationResult.canEnter ? "Funciona" : "No funciona"}
                    </Badge>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="border border-black/8 bg-white p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#7a7f87]">
                        Plan actual
                      </p>
                      <p className="mt-2 text-sm font-semibold text-[#111111]">
                        {validationResult.membershipRequest?.planTitle ??
                          validationResult.member.planTitle ??
                          "Sin membresia operativa"}
                      </p>
                    </div>
                    <div className="border border-black/8 bg-white p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#7a7f87]">
                        Estado del socio
                      </p>
                      <p className="mt-2 text-sm font-semibold uppercase text-[#111111]">
                        {validationResult.member.status}
                      </p>
                    </div>
                    <div className="border border-black/8 bg-white p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#7a7f87]">
                        Inicio
                      </p>
                      <p className="mt-2 text-sm font-semibold text-[#111111]">
                        {validationResult.membershipRequest?.cycleStartsOn
                          ? formatMemberAccountDate(validationResult.membershipRequest.cycleStartsOn)
                          : "Sin ciclo activo"}
                      </p>
                    </div>
                    <div className="border border-black/8 bg-white p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#7a7f87]">
                        Fin
                      </p>
                      <p className="mt-2 text-sm font-semibold text-[#111111]">
                        {validationResult.membershipRequest?.cycleEndsOn
                          ? formatMemberAccountDate(validationResult.membershipRequest.cycleEndsOn)
                          : "Sin ciclo activo"}
                      </p>
                    </div>
                  </div>
                </AdminSurface>

                <AdminSurface inset className="border-black/5 p-5">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center border border-[#d71920]/10 bg-[#fff5f5] text-[#d71920]">
                        <UserRound className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#7a7f87]">
                          Recepcion
                        </p>
                        <p className="text-sm font-semibold text-[#111111]">
                          {validationResult.validationLabel}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm text-[#5f6368]">
                      <p>Sede: {validationResult.member.branchName ?? "Sin sede asignada"}</p>
                      <p>Coach: {validationResult.member.trainerName ?? "Sin coach asignado"}</p>
                      <p>
                        Solicitud:{" "}
                        {validationResult.membershipRequest
                          ? `${validationResult.membershipRequest.requestNumber} · ${membershipRequestStatusLabels[validationResult.membershipRequest.status]}`
                          : "Sin solicitud operativa"}
                      </p>
                    </div>

                    <div className="grid gap-3">
                      <Button asChild className="w-full">
                        <Link href={`/dashboard/miembros/${validationResult.member.id}`}>
                          Abrir ficha del socio
                        </Link>
                      </Button>

                      {validationResult.membershipRequest ? (
                        <Button asChild variant="outline" className="w-full">
                          <Link
                            href={`/dashboard/membresias/pedidos/${validationResult.membershipRequest.id}`}
                          >
                            Abrir detalle de membresia
                          </Link>
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </AdminSurface>
              </div>
            ) : null}
          </div>
        )}
      </AdminSection>
    </div>
  );
}
