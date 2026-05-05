import { Banknote } from "lucide-react";
import { AdminSection } from "@/components/admin/shared/layout/AdminSection";
import { AdminFormField } from "@/components/admin/shared/forms/AdminFormField";
import { AdminFormSelect } from "@/components/admin/shared/forms/AdminFormSelect";
import { AdminFormCheckbox } from "@/components/admin/shared/forms/AdminFormCheckbox";
import { productStockStatusLabels } from "@/lib/data/products";

export function StoreProductPricingSection() {
  return (
    <AdminSection title="Precios e Inventario" icon={Banknote}>
      <div className="grid gap-5 md:grid-cols-5">
        <AdminFormField
          name="price"
          label="Precio real"
          type="number"
          inputClassName="font-bold"
        />
        <AdminFormField
          name="paypal_price_usd"
          label="Referencia USD (PayPal)"
          type="number"
        />
        <AdminFormField
          name="compare_price"
          label="Precio Original"
          type="number"
        />
        <AdminFormField
          name="currency"
          label="Moneda"
        />
        <AdminFormField
          name="order"
          label="Orden"
          type="number"
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <AdminFormField name="discount_label" label="Etiqueta de descuento" />
        <AdminFormField name="cta_label" label="CTA" />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <AdminFormSelect
          name="stock_status"
          label="Estado de Stock"
          options={Object.entries(productStockStatusLabels).map(([value, label]) => ({
            value,
            label,
          }))}
        />
        <div className="pt-8">
          <AdminFormCheckbox name="pickup_only" label="Solo recogida local" />
        </div>
      </div>
    </AdminSection>
  );
}
