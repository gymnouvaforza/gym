import { Package } from "lucide-react";
import { AdminSection } from "@/components/admin/shared/layout/AdminSection";
import { AdminFormField } from "@/components/admin/shared/forms/AdminFormField";
import { AdminFormSelect } from "@/components/admin/shared/forms/AdminFormSelect";
import type { StoreCategory } from "@/lib/data/store";
import { flattenStoreCategoryOptions } from "@/lib/data/store";

interface StoreProductIdentitySectionProps {
  categories: StoreCategory[];
}

export function StoreProductIdentitySection({ categories }: StoreProductIdentitySectionProps) {
  const categoryOptions = flattenStoreCategoryOptions(categories);

  return (
    <AdminSection title="Identidad del Producto" icon={Package}>
      <div className="grid gap-5 md:grid-cols-2">
        <AdminFormField
          name="name"
          label="Nombre"
          placeholder="Nombre del producto"
        />
        <AdminFormField
          name="slug"
          label="Slug"
          placeholder="Se autogenera si lo dejas vacio"
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <AdminFormSelect
          name="category_id"
          label="Subcategoria"
          options={[
            { value: "", label: "Selecciona categoria..." },
            ...categoryOptions.map((opt) => ({
              value: opt.value,
              label: `${opt.depth > 0 ? "— " : ""}${opt.label}`,
            })),
          ]}
        />
        <AdminFormField
          name="eyebrow"
          label="Eyebrow (Etiqueta superior)"
          placeholder="Ej. Edición Limitada"
        />
      </div>
    </AdminSection>
  );
}
