import { notFound } from "next/navigation";
import { ShieldCheck, ShieldAlert, Clock3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { getPublicMembershipStatusByToken } from "@/lib/data/memberships";
import { membershipValidationStatusLabels } from "@/lib/memberships";
import { formatMemberAccountDate } from "@/lib/member-account";

export const dynamic = "force-dynamic";

const validationIconMap = {
  al_dia: ShieldCheck,
  pendiente: Clock3,
  vencido: ShieldAlert,
} as const;

export default async function MembershipValidationPage({
  params,
}: Readonly<{
  params: Promise<{ token: string }>;
}>) {
  const { token } = await params;
  const validation = await getPublicMembershipStatusByToken(token);

  if (!validation) {
    notFound();
  }

  const Icon = validationIconMap[validation.validation.status];

  return (
    <main className="min-h-screen bg-[#111111] px-6 py-12 text-white">
      <div className="mx-auto max-w-[760px] space-y-8">
        <div className="border border-white/10 bg-white/[0.03] p-8 shadow-[0_30px_80px_-45px_rgba(0,0,0,0.6)]">
          <div className="flex flex-col gap-6 border-b border-white/10 pb-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-[0.38em] text-[#d71920]">
                Estado publico
              </p>
              <h1 className="font-display text-4xl font-black uppercase tracking-tight">
                {validation.member.fullName}
              </h1>
              <p className="text-sm uppercase tracking-[0.2em] text-white/45">
                {validation.member.memberNumber}
              </p>
            </div>
            <Badge variant={validation.validation.tone === "success" ? "success" : "warning"}>
              {membershipValidationStatusLabels[validation.validation.status]}
            </Badge>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-[120px_1fr]">
            <div className="flex h-28 w-28 items-center justify-center border border-white/10 bg-white/[0.04]">
              <Icon className="h-14 w-14 text-[#d71920]" />
            </div>
            <div className="space-y-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/45">
                  Plan actual
                </p>
                <p className="mt-2 text-2xl font-black uppercase tracking-tight">
                  {validation.planTitle}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/45">
                  Estado
                </p>
                <p className="mt-2 text-lg font-semibold">{validation.validation.label}</p>
                <p className="mt-2 text-sm text-white/65">
                  Esta pagina publica solo muestra si la membresia esta vigente o no. El ingreso en
                  recepcion se confirma desde el panel del equipo.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/45">
                    Inicio
                  </p>
                  <p className="mt-2 text-sm font-semibold">
                    {validation.validation.cycleStartsOn
                      ? formatMemberAccountDate(validation.validation.cycleStartsOn)
                      : "Pendiente"}
                  </p>
                </div>
                <div className="border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/45">
                    Fin
                  </p>
                  <p className="mt-2 text-sm font-semibold">
                    {validation.validation.cycleEndsOn
                      ? formatMemberAccountDate(validation.validation.cycleEndsOn)
                      : "Pendiente"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
