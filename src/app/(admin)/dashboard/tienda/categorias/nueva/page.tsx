import DashboardNotice from "@/components/admin/DashboardNotice";
import DashboardPageHeader from "@/components/admin/DashboardPageHeader";
import StoreCategoryForm from "@/components/admin/StoreCategoryForm";
import { getStoreAdminSnapshot, getStoreAdminWriteDisabledReason } from "@/lib/data/store-admin";

export default async function DashboardNewStoreCategoryPage() {
  const snapshot = await getStoreAdminSnapshot();
  const disabledReason = getStoreAdminWriteDisabledReason();

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Nueva categoria"
        description="Crea una categoria raiz o una subcategoria bajo una raiz existente."
      />
      {snapshot.warning ? <DashboardNotice message={snapshot.warning} /> : null}
      {disabledReason ? <DashboardNotice message={disabledReason} /> : null}
      <StoreCategoryForm categories={snapshot.categories} disabledReason={disabledReason} />
    </div>
  );
}
