import DashboardNotice from "@/components/admin/DashboardNotice";
import DashboardPageHeader from "@/components/admin/DashboardPageHeader";
import StoreProductForm from "@/components/admin/StoreProductForm";
import { getStoreAdminSnapshot, getStoreAdminWriteDisabledReason } from "@/lib/data/store-admin";

export default async function DashboardNewStoreProductPage() {
  const snapshot = await getStoreAdminSnapshot();
  const disabledReason = getStoreAdminWriteDisabledReason();

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Nuevo producto"
        description="Crea un producto y asignalo a una subcategoria valida de la tienda."
      />
      {snapshot.warning ? <DashboardNotice message={snapshot.warning} /> : null}
      {disabledReason ? <DashboardNotice message={disabledReason} /> : null}
      <StoreProductForm categories={snapshot.categories} disabledReason={disabledReason} />
    </div>
  );
}
