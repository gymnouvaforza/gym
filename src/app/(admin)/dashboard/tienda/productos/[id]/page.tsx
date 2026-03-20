import { notFound } from "next/navigation";

import { deactivateStoreProduct } from "@/app/(admin)/dashboard/tienda/actions";
import DashboardNotice from "@/components/admin/DashboardNotice";
import DashboardPageHeader from "@/components/admin/DashboardPageHeader";
import StoreProductForm from "@/components/admin/StoreProductForm";
import { Button } from "@/components/ui/button";
import {
  getStoreAdminProduct,
  getStoreAdminSnapshot,
  getStoreAdminWriteDisabledReason,
} from "@/lib/data/store-admin";

interface StoreProductEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DashboardStoreProductEditPage({
  params,
}: Readonly<StoreProductEditPageProps>) {
  const { id } = await params;
  const [product, snapshot] = await Promise.all([
    getStoreAdminProduct(id),
    getStoreAdminSnapshot(),
  ]);

  if (!product) {
    notFound();
  }

  const disabledReason = getStoreAdminWriteDisabledReason();

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Editar producto"
        description="Ajusta categoria, precio, contenidos de ficha y estado operativo del producto."
      />
      {snapshot.warning ? <DashboardNotice message={snapshot.warning} /> : null}
      {disabledReason ? <DashboardNotice message={disabledReason} /> : null}
      <StoreProductForm
        product={product}
        categories={snapshot.categories}
        disabledReason={disabledReason}
      />
      <form action={deactivateStoreProduct.bind(null, product.id)}>
        <Button type="submit" variant="outline" disabled={Boolean(disabledReason)}>
          Desactivar producto
        </Button>
      </form>
    </div>
  );
}
