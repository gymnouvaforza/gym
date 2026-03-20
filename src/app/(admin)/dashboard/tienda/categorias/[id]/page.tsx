import { notFound } from "next/navigation";

import { deactivateStoreCategory } from "@/app/(admin)/dashboard/tienda/actions";
import DashboardNotice from "@/components/admin/DashboardNotice";
import DashboardPageHeader from "@/components/admin/DashboardPageHeader";
import StoreCategoryForm from "@/components/admin/StoreCategoryForm";
import { Button } from "@/components/ui/button";
import {
  getStoreAdminCategory,
  getStoreAdminSnapshot,
  getStoreAdminWriteDisabledReason,
} from "@/lib/data/store-admin";

interface StoreCategoryEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DashboardStoreCategoryEditPage({
  params,
}: Readonly<StoreCategoryEditPageProps>) {
  const { id } = await params;
  const [category, snapshot] = await Promise.all([
    getStoreAdminCategory(id),
    getStoreAdminSnapshot(),
  ]);

  if (!category) {
    notFound();
  }

  const disabledReason = getStoreAdminWriteDisabledReason();

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Editar categoria"
        description="Ajusta nombre, slug, jerarquia y estado de la categoria."
      />
      {snapshot.warning ? <DashboardNotice message={snapshot.warning} /> : null}
      {disabledReason ? <DashboardNotice message={disabledReason} /> : null}
      <StoreCategoryForm
        category={category}
        categories={snapshot.categories}
        disabledReason={disabledReason}
      />
      <form action={deactivateStoreCategory.bind(null, category.id)}>
        <Button type="submit" variant="outline" disabled={Boolean(disabledReason)}>
          Desactivar categoria
        </Button>
      </form>
    </div>
  );
}
