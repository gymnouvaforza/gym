import { notFound } from "next/navigation";
import { Activity, Calendar, CreditCard, Mail, MapPin, User } from "lucide-react";

import AdminSurface from "@/components/admin/AdminSurface";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getDashboardMemberDetail,
  listDashboardAuthLinkOptions,
  listDashboardTrainerOptions,
} from "@/lib/data/gym-management";
import { listMembershipPlans } from "@/lib/data/memberships";
import { cn } from "@/lib/utils";

import MemberFinanceTab from "./components/MemberFinanceTab";
import MemberProfileTab from "./components/MemberProfileTab";
import MemberProgressTab from "./components/MemberProgressTab";
import MemberTrainingTab from "./components/MemberTrainingTab";

export default async function DashboardMemberDetailPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  const [detail, authOptions, trainerOptions, membershipPlans] = await Promise.all([
    getDashboardMemberDetail(id),
    listDashboardAuthLinkOptions(),
    listDashboardTrainerOptions(),
    listMembershipPlans({ activeOnly: false }),
  ]);

  if (!detail) {
    notFound();
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 border-b border-black/5 -mx-8 -mt-8 mb-8">
        <div className="flex items-center gap-6">
          <div className="size-20 rounded-2xl bg-[#111111] flex items-center justify-center shadow-2xl shadow-black/20">
            <User className="size-10 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#d71920] bg-red-50 px-2 py-0.5 rounded">
                Socio {detail.member.memberNumber}
              </span>
              <Badge variant="muted" className="text-[9px] font-bold border-black/10">
                ID: {detail.member.id.split("-")[0].toUpperCase()}
              </Badge>
            </div>
            <h1 className="text-4xl font-black text-[#111111] tracking-tighter uppercase leading-none">
              {detail.member.fullName}
            </h1>
            <p className="text-sm font-bold text-[#7a7f87] mt-2 flex items-center gap-2">
              <Mail className="size-3.5" /> {detail.member.email}
              <span className="opacity-20">|</span>
              <MapPin className="size-3.5" /> {detail.member.branchName ?? "Sede Central"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            disabled
            title="Accion pendiente de implementacion operativa."
            className="h-12 px-6 font-black uppercase text-[10px] tracking-widest border-2"
          >
            Anular Ficha No Disponible
          </Button>
          <Button
            disabled
            title="Acciones rapidas pendientes de backend."
            className="h-12 px-8 bg-[#d71920] hover:bg-[#b0141a] text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-red-500/20 transition-all"
          >
            Acciones No Disponibles
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <AdminSurface
          className={cn(
            "p-6 border-none shadow-sm transition-all duration-300 relative overflow-hidden",
            detail.member.status === "active"
              ? "bg-emerald-600 text-white shadow-emerald-500/20"
              : "bg-[#111111] text-white",
          )}
        >
          <div className="relative z-10">
            <p className="text-[9px] font-black uppercase tracking-[0.25em] opacity-80 mb-4">
              Estado Membresia
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tighter">
                {detail.member.status.toUpperCase()}
              </span>
            </div>
            <p className="mt-4 text-[11px] font-medium text-white/90 leading-relaxed max-w-[200px]">
              {detail.statusMeta.helperText}
            </p>
          </div>
          <Activity className="absolute -right-4 -bottom-4 size-32 opacity-10 -rotate-12" />
        </AdminSurface>

        <AdminSurface
          className={cn(
            "p-6 border-none shadow-sm transition-all duration-300 bg-white relative overflow-hidden",
            (detail.financials?.balanceDue ?? 0) > 0 ? "ring-2 ring-red-500/20" : "",
          )}
        >
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#7a7f87] mb-4">
            Deuda Pendiente
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-[14px] font-black text-[#7a7f87]">S/</span>
            <span
              className={cn(
                "text-4xl font-black tracking-tighter",
                (detail.financials?.balanceDue ?? 0) > 0 ? "text-[#d71920]" : "text-[#111111]",
              )}
            >
              {detail.financials?.balanceDue.toFixed(2) ?? "0.00"}
            </span>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div
              className={cn(
                "h-2 w-2 rounded-full",
                (detail.financials?.balanceDue ?? 0) > 0 ? "bg-[#d71920] animate-pulse" : "bg-emerald-500",
              )}
            />
            <p
              className={cn(
                "text-[10px] font-black uppercase tracking-widest",
                (detail.financials?.balanceDue ?? 0) > 0 ? "text-[#d71920]" : "text-emerald-600",
              )}
            >
              {(detail.financials?.balanceDue ?? 0) > 0 ? "Pago Requerido" : "Cuenta al dia"}
            </p>
          </div>
          <CreditCard className="absolute -right-4 -bottom-4 size-32 opacity-5 -rotate-12 text-black" />
        </AdminSurface>

        <AdminSurface className="p-6 border-none shadow-sm bg-white relative overflow-hidden">
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#7a7f87] mb-4">
            Vencimiento
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#111111] tracking-tighter uppercase">
              {detail.financials?.endDate
                ? new Date(detail.financials.endDate).toLocaleDateString("es-PE", {
                    day: "2-digit",
                    month: "short",
                  })
                : "---"}
            </span>
            <span className="text-[10px] font-bold text-[#7a7f87] uppercase">
              {detail.financials?.endDate
                ? new Date(detail.financials.endDate).getFullYear()
                : ""}
            </span>
          </div>
          <p className="mt-4 text-[11px] font-bold text-[#5f6368] uppercase flex items-center gap-1.5">
            Proxima renovacion sugerida
          </p>
          <Calendar className="absolute -right-4 -bottom-4 size-32 opacity-5 -rotate-12 text-black" />
        </AdminSurface>
      </div>

      <Tabs defaultValue="perfil" className="w-full">
        <div className="flex items-center justify-between mb-8 border-b border-black/5">
          <TabsList className="bg-transparent p-0 h-auto gap-12">
            <TabsTrigger
              value="perfil"
              className="data-[state=active]:text-[#d71920] data-[state=active]:border-[#d71920] border-b-4 border-transparent rounded-none px-0 pb-4 font-black uppercase text-[11px] tracking-[0.2em] transition-all bg-transparent shadow-none shadow-transparent"
            >
              Perfil
            </TabsTrigger>
            <TabsTrigger
              value="finanzas"
              className="data-[state=active]:text-[#d71920] data-[state=active]:border-[#d71920] border-b-4 border-transparent rounded-none px-0 pb-4 font-black uppercase text-[11px] tracking-[0.2em] transition-all bg-transparent shadow-none shadow-transparent"
            >
              Finanzas
            </TabsTrigger>
            <TabsTrigger
              value="progreso"
              className="data-[state=active]:text-[#d71920] data-[state=active]:border-[#d71920] border-b-4 border-transparent rounded-none px-0 pb-4 font-black uppercase text-[11px] tracking-[0.2em] transition-all bg-transparent shadow-none shadow-transparent"
            >
              Progreso
            </TabsTrigger>
            <TabsTrigger
              value="entrenamiento"
              className="data-[state=active]:text-[#d71920] data-[state=active]:border-[#d71920] border-b-4 border-transparent rounded-none px-0 pb-4 font-black uppercase text-[11px] tracking-[0.2em] transition-all bg-transparent shadow-none shadow-transparent"
            >
              Entrenamiento
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="perfil" className="outline-none focus:ring-0">
          <MemberProfileTab detail={detail} authOptions={authOptions} trainerOptions={trainerOptions} />
        </TabsContent>

        <TabsContent value="finanzas" className="outline-none focus:ring-0">
          <MemberFinanceTab
            financials={detail.financials}
            memberId={id}
            memberEmail={detail.member.email}
            memberName={detail.member.fullName}
            memberPhone={detail.member.phone}
            membershipPlans={membershipPlans}
          />
        </TabsContent>

        <TabsContent value="progreso" className="outline-none focus:ring-0">
          <MemberProgressTab measurements={detail.measurements} memberId={id} />
        </TabsContent>

        <TabsContent value="entrenamiento" className="outline-none focus:ring-0">
          <MemberTrainingTab
            detail={detail.member}
            assignmentHistory={detail.assignmentHistory}
            availableTemplates={detail.availableTemplates}
            trainingFeedback={detail.trainingFeedback}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
