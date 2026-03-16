import DashboardNotice from "@/components/admin/DashboardNotice";
import DashboardPageHeader from "@/components/admin/DashboardPageHeader";
import LeadsTable from "@/components/admin/LeadsTable";
import { getDashboardCapabilities } from "@/lib/auth";
import { getDashboardData } from "@/lib/data/site";

export default async function DashboardLeadsPage() {
  const { leads, warning } = await getDashboardData();
  const { isLocalReadOnly } = await getDashboardCapabilities();
  const disabledReason = isLocalReadOnly
    ? "Modo local en solo lectura. Anade SUPABASE_SERVICE_ROLE_KEY para actualizar leads reales."
    : undefined;

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="Leads"
        description="Contactos recibidos desde la web publica del gimnasio y su seguimiento comercial."
      />
      {warning ? <DashboardNotice message={warning} /> : null}
      {disabledReason ? <DashboardNotice message={disabledReason} /> : null}
      <LeadsTable leads={leads} disabledReason={disabledReason} />
    </div>
  );
}
