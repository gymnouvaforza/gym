import DashboardNotice from "@/components/admin/DashboardNotice";
import DashboardPageHeader from "@/components/admin/DashboardPageHeader";
import SettingsForm from "@/components/admin/SettingsForm";
import { getDashboardCapabilities } from "@/lib/auth";
import { getDashboardData } from "@/lib/data/site";

export default async function DashboardSettingsPage() {
  const { settings, warning } = await getDashboardData();
  const { isLocalReadOnly } = await getDashboardCapabilities();
  const disabledReason = isLocalReadOnly
    ? "Modo local en solo lectura. Anade SUPABASE_SERVICE_ROLE_KEY para guardar cambios reales."
    : undefined;

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="Ajustes"
        description="Ajustes globales editables de Nova Forza: identidad, hero con video, topbar promocional, contacto visible y SEO basico."
      />
      {warning ? <DashboardNotice message={warning} /> : null}
      {disabledReason ? <DashboardNotice message={disabledReason} /> : null}
      <SettingsForm settings={settings} disabledReason={disabledReason} />
    </div>
  );
}
