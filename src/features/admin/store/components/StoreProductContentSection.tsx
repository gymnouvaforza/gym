import { useFormContext } from "react-hook-form";
import { AdminFormTextarea } from "@/components/admin/shared/forms/AdminFormTextarea";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import ImageUpload from "@/components/admin/ImageUpload";
import AdminSurface from "@/components/admin/AdminSurface";

interface StoreProductContentSectionProps {
  isPending: boolean;
  disabledReason?: string;
}

export function StoreProductContentSection({
  isPending,
  disabledReason,
}: StoreProductContentSectionProps) {
  const { control } = useFormContext();

  return (
    <div className="space-y-6">
      <AdminFormTextarea
        name="short_description"
        label="Descripcion corta"
        placeholder="Breve resumen del producto..."
        rows={3}
      />

      <AdminFormTextarea
        name="description"
        label="Descripcion completa"
        placeholder="Detalles extendidos, beneficios y características..."
        rows={5}
      />

      <AdminSurface className="p-6">
        <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-black/40">
          Multimedia y Especificaciones
        </h3>
        <div className="grid gap-6">
          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              control={control}
              name="images_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Imagenes del producto
                  </FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value ? field.value.split("\n").filter(Boolean) : []}
                      onChange={(urls) => field.onChange(urls.join("\n"))}
                      disabled={isPending || Boolean(disabledReason)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <AdminFormTextarea
              name="specifications_text"
              label="Especificaciones (Label: Valor)"
              rows={4}
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <AdminFormTextarea name="tags_text" label="Tags (una por linea)" rows={4} />
            <AdminFormTextarea name="highlights_text" label="Highlights (uno por linea)" rows={4} />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <AdminFormTextarea name="benefits_text" label="Beneficios (uno por linea)" rows={4} />
            <AdminFormTextarea name="usage_steps_text" label="Pasos de uso (uno por linea)" rows={4} />
          </div>
        </div>
      </AdminSurface>
    </div>
  );
}
