import Link from "next/link";
import { DoorOpen, ExternalLink, QrCode, ShieldCheck, UserRound } from "lucide-react";

import AdminSection from "@/components/admin/AdminSection";
import AdminSurface from "@/components/admin/AdminSurface";
import DashboardPageHeader from "@/components/admin/DashboardPageHeader";
import MembershipOpsSubnav from "@/components/admin/MembershipOpsSubnav";
import MembershipReceptionScanner from "@/components/admin/MembershipReceptionScanner";
import { Badge } from "@/components/ui/badge";
import FeedbackCallout from "@/components/ui/feedback-callout";
import { Button } from "@/components/ui/button";
import { requireAdminUser } from "@/lib/auth";
import {
  getDashboardMembershipScanResultByToken,
  parseMembershipQrScanToken,
} from "@/lib/data/memberships";
import { formatMemberAccountDate } from "@/lib/member-account";
import {
  membershipRequestStatusLabels,
  membershipValidationStatusLabels,
} from "@/lib/memberships";

function getValidationBadgeVariant(
  tone: "default" | "muted" | "success" | "warning",
): "default" | "muted" | "success" | "warning" {
  return tone === "default" ? "muted" : tone;
}

export default async function DashboardMembershipReceptionPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>) {
  await requireAdminUser();

  const params = await searchParams;
  const rawToken = Array.isArray(params.token) ? params.token[0] ?? "" : params.token ?? "";
  const parsedToken = rawToken ? parseMembershipQrScanToken(rawToken) : null;
  const scanResult = parsedToken
    ? await getDashboardMembershipScanResultByToken(parsedToken)
    : null;
  const hasInvalidFormat = Boolean(rawToken) && !parsedToken;
  const hasMissingMember = Boolean(parsedToken) && !scanResult;

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-6 border-b border-black/5 pb-8 md:flex-row md:items-end md:justify-between">
        <DashboardPageHeader
          title="RECEPCION QR"
          description="Escaneo rapido para validar membresias y saltar a la ficha del socio sin pasar por la vista publica."
          eyebrow="Membership ops"
          icon={DoorOpen}
          className="pb-0"
        />
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard/membresias/pedidos"
            className="flex h-12 items-center justify-center border border-black/10 bg-white px-6 text-[10px] font-black uppercase tracking-[0.18em] text-[#111111] transition-colors hover:bg-[#111111] hover:text-white"
          >
            Volver a solicitudes
          </Link>
        </div>
      </div>

      <MembershipOpsSubnav />

      <div className="grid gap-8 xl:grid-cols-[440px_minmax(0,1fr)]">
        <AdminSection
          title="Escaner operativo"
          description="Activa la camara del dispositivo de recepcion o pega el QR si el navegador no da permisos."
          icon={QrCode}
        >
          <MembershipReceptionScanner initialValue={rawToken} />
        </AdminSection>

        <AdminSection
          title="Resultado de recepcion"
          description="Panel compacto para decidir rapido si la persona tiene una membresia operativa vigente o si necesita revision manual."
          icon={ShieldCheck}
        >
          {!rawToken ? (
            <FeedbackCallout
              chrome="admin"
              tone="info"
              title="Listo para escanear"
              message="Aun no se ha leido ningun QR. Cuando llegue una lectura valida, aqui veras el estado del socio, su plan y accesos rapidos a la ficha."
            />
          ) : hasInvalidFormat ? (
            <FeedbackCallout
              chrome="admin"
              tone="error"
              title="Lectura no reconocida"
              message="El valor escaneado no parece un QR de membresia del gimnasio. Usa una URL de validacion o el token operativo del socio."
            />
          ) : hasMissingMember ? (
            <FeedbackCallout
              chrome="admin"
              tone="warning"
              title="QR sin socio vinculado"
              message="El token es valido en formato, pero no corresponde a ninguna ficha activa del sistema. Revisa si el QR pertenece a otro entorno o si el socio todavia no esta dado de alta."
            />
          ) : scanResult ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                <AdminSurface inset className="border-black/5 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-black/8 pb-4">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#d71920]">
                        Socio detectado
                      </p>
                      <h3 className="text-2xl font-black uppercase tracking-tight text-[#111111]">
                        {scanResult.member.fullName}
                      </h3>
                      <p className="text-[12px] uppercase tracking-[0.18em] text-[#5f6368]">
                        {scanResult.member.memberNumber}
                      </p>
                    </div>
                    <Badge
                      variant={
                        scanResult.validation
                          ? getValidationBadgeVariant(scanResult.validation.tone)
                          : "muted"
                      }
                    >
                      {scanResult.validation
                        ? membershipValidationStatusLabels[scanResult.validation.status]
                        : "Sin ciclo operativo"}
                    </Badge>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="border border-black/8 bg-white p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#7a7f87]">
                        Plan actual
                      </p>
                      <p className="mt-2 text-sm font-semibold text-[#111111]">
                        {scanResult.planTitle}
                      </p>
                    </div>
                    <div className="border border-black/8 bg-white p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#7a7f87]">
                        Estado en sistema
                      </p>
                      <p className="mt-2 text-sm font-semibold uppercase text-[#111111]">
                        {scanResult.member.status}
                      </p>
                    </div>
                    <div className="border border-black/8 bg-white p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#7a7f87]">
                        Inicio
                      </p>
                      <p className="mt-2 text-sm font-semibold text-[#111111]">
                        {scanResult.cycleStartsOn
                          ? formatMemberAccountDate(scanResult.cycleStartsOn)
                          : "Sin ciclo activo"}
                      </p>
                    </div>
                    <div className="border border-black/8 bg-white p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#7a7f87]">
                        Fin
                      </p>
                      <p className="mt-2 text-sm font-semibold text-[#111111]">
                        {scanResult.cycleEndsOn
                          ? formatMemberAccountDate(scanResult.cycleEndsOn)
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
                          {scanResult.validation
                            ? scanResult.validation.label
                            : "Socio registrado sin ciclo operativo vigente."}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm text-[#5f6368]">
                      <p>Sede: {scanResult.member.branchName ?? "Sin sede asignada"}</p>
                      <p>Coach: {scanResult.member.trainerName ?? "Sin coach asignado"}</p>
                      <p>
                        Solicitud:{" "}
                        {scanResult.requestNumber && scanResult.requestStatus
                          ? `${scanResult.requestNumber} · ${membershipRequestStatusLabels[scanResult.requestStatus]}`
                          : "Sin solicitud activa"}
                      </p>
                    </div>

                    <div className="grid gap-3">
                      <Button asChild className="w-full">
                        <Link href={`/dashboard/miembros/${scanResult.member.id}`}>
                          Abrir ficha del socio
                        </Link>
                      </Button>

                      {scanResult.membershipRequestId ? (
                        <Button asChild variant="outline" className="w-full">
                          <Link href={`/dashboard/membresias/pedidos/${scanResult.membershipRequestId}`}>
                            Abrir detalle de membresia
                          </Link>
                        </Button>
                      ) : null}

                      <Button asChild variant="outline" className="w-full">
                        <Link
                          href={scanResult.publicValidationUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Abrir validacion publica
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </AdminSurface>
              </div>
            </div>
          ) : null}
        </AdminSection>
      </div>
    </div>
  );
}
