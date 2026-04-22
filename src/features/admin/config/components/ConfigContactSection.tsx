import { Mail } from "lucide-react";
import { AdminSection } from "@/components/admin/shared/layout/AdminSection";
import { AdminFormField } from "@/components/admin/shared/forms/AdminFormField";
import { AdminFormTextarea } from "@/components/admin/shared/forms/AdminFormTextarea";

export function ConfigContactSection() {
  return (
    <AdminSection title="Contacto y Operaciones" icon={Mail}>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <AdminFormField
            name="contact_email"
            label="Email público de contacto"
            type="email"
          />
          <p className="text-[10px] leading-relaxed text-[#5f6368] uppercase font-bold px-1">
            Visible en web, footer y formularios.
          </p>
        </div>
        <div className="space-y-2">
          <AdminFormField
            name="notification_email"
            label="Correo operativo interno"
            type="email"
          />
          <p className="text-[10px] leading-relaxed text-[#5f6368] uppercase font-bold px-1">
            Avisos de pedidos y acciones operativas.
          </p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <AdminFormField
            name="transactional_from_email"
            label="Remitente transaccional"
            type="email"
          />
          <p className="text-[10px] leading-relaxed text-[#5f6368] uppercase font-bold px-1">
            Remitente visible de los emails automáticos.
          </p>
        </div>
        <AdminFormField name="contact_phone" label="Teléfono" />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <AdminFormField
            name="whatsapp_url"
            label="Enlace de WhatsApp"
            placeholder="https://wa.me/..."
          />
          <p className="text-[10px] leading-relaxed text-[#5f6368] uppercase font-bold px-1">
            Alimenta el botón flotante de la portada.
          </p>
        </div>
        <AdminFormField name="address" label="Dirección física" />
      </div>

      <AdminFormTextarea
        name="opening_hours"
        label="Horarios de atención"
        rows={3}
      />
    </AdminSection>
  );
}
