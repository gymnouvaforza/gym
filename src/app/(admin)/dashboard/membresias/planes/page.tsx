import { ClipboardList, Edit3, Plus, Snowflake } from "lucide-react";

import { deleteMembershipPlan } from "@/app/(admin)/dashboard/membresias/planes/actions";
import AdminMetricCard from "@/components/admin/AdminMetricCard";
import AdminSection from "@/components/admin/AdminSection";
import DashboardPageHeader from "@/components/admin/DashboardPageHeader";
import DeleteEntityButton from "@/components/admin/DeleteEntityButton";
import MembershipOpsSubnav from "@/components/admin/MembershipOpsSubnav";
import MembershipPlanForm from "@/components/admin/MembershipPlanForm";
import { Badge } from "@/components/ui/badge";
import { listMembershipPlans } from "@/lib/data/memberships";

function formatPlanPrice(amount: number, currencyCode: string) {
  return new Intl.NumberFormat("es-PE", {
    currency: currencyCode,
    style: "currency",
  }).format(amount);
}

export default async function DashboardMembershipPlansPage() {
  const plans = await listMembershipPlans({ activeOnly: false });
  const activePlans = plans.filter((plan) => plan.is_active).length;
  const freezablePlans = plans.filter((plan) => plan.is_freezable).length;

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="Planes de membresia"
        description="Administra codigos, precios y reglas de congelamiento usadas por altas y renovaciones."
      />

      <MembershipOpsSubnav />

      <div className="grid gap-4 md:grid-cols-3">
        <AdminMetricCard
          label="Planes cargados"
          value={String(plans.length)}
          hint="Catalogo operativo de membresias."
          icon={ClipboardList}
        />
        <AdminMetricCard
          label="Activos"
          value={String(activePlans)}
          hint="Visibles para solicitudes publicas."
          tone="success"
          icon={Plus}
        />
        <AdminMetricCard
          label="Congelables"
          value={String(freezablePlans)}
          hint="Con pausa permitida para socios."
          tone="warning"
          icon={Snowflake}
        />
      </div>

      <AdminSection
        title="Nuevo plan"
        description="Crea un plan operativo. El codigo se usa como identificador interno unico."
      >
        <MembershipPlanForm />
      </AdminSection>

      <AdminSection
        title="Listado de planes"
        description="Edita reglas existentes o elimina planes sin solicitudes asociadas."
      >
        {plans.length === 0 ? (
          <div className="border-2 border-dashed border-black/10 bg-[#fbfbf8] p-10 text-center">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#7a7f87]">
              No hay planes de membresia cargados.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {plans.map((plan) => (
              <details key={plan.id} className="group border border-black/10 bg-white p-5 shadow-sm">
                <summary className="flex cursor-pointer list-none flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#d71920]">
                        {plan.code}
                      </span>
                      <Badge variant={plan.is_active ? "success" : "muted"}>
                        {plan.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                      {plan.is_freezable ? <Badge variant="warning">Congelable</Badge> : null}
                    </div>
                    <div>
                      <h2 className="text-lg font-black uppercase tracking-tight text-[#111111]">
                        {plan.title}
                      </h2>
                      <p className="text-sm text-[#5f6368]">
                        {formatPlanPrice(plan.price_amount, plan.currency_code)} - {plan.duration_days} dias
                        {plan.bonus_days > 0 ? ` - ${plan.bonus_days} dias bonus` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">
                    <Edit3 className="h-4 w-4" />
                    Editar
                  </div>
                </summary>

                <div className="mt-6 border-t border-black/5 pt-6">
                  <MembershipPlanForm plan={plan} />
                  <div className="mt-4 flex justify-end">
                    <DeleteEntityButton
                      entityId={plan.id}
                      onDelete={deleteMembershipPlan}
                      title="Eliminar plan de membresia"
                      description={`Se intentara eliminar ${plan.title}. Si tiene solicitudes asociadas, Supabase bloqueara la operacion.`}
                      redirectTo="/dashboard/membresias/planes"
                      successMessage="Plan eliminado correctamente."
                      errorMessage="No se pudo eliminar el plan."
                      label="Eliminar plan"
                      pendingLabel="Eliminando..."
                      variant="outline"
                      className="border-[#d71920]/30 text-[#d71920] hover:bg-[#fff5f5]"
                    />
                  </div>
                </div>
              </details>
            ))}
          </div>
        )}
      </AdminSection>
    </div>
  );
}
