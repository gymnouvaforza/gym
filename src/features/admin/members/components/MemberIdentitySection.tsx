"use client"

import { User, Mail, Phone, Calendar, MapPin } from "lucide-react"
import { NFCard } from "@/components/system/nf-card"
import { NFField } from "@/components/system/nf-field"

export function MemberIdentitySection() {
  return (
    <NFCard 
      title="Identidad del Socio" 
      description="Información personal y de contacto básica."
      className="shadow-sm"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <NFField 
          name="fullName" 
          label="Nombre Completo" 
          icon={User}
          placeholder="Ej. Juan Pérez"
          tooltip="Nombre oficial que aparecerá en su carnet digital."
        />
        <NFField 
          name="email" 
          label="Email Corporativo / Personal" 
          icon={Mail}
          type="email"
          placeholder="juan@ejemplo.com"
          tooltip="Se usará para enviar recordatorios de pago y rutinas."
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 mt-6">
        <NFField 
          name="phone" 
          label="Teléfono de Contacto" 
          icon={Phone}
          placeholder="+51 900 000 000"
          tooltip="Número de WhatsApp para comunicaciones rápidas."
        />
        <NFField 
          name="joinDate" 
          label="Fecha de Alta" 
          icon={Calendar}
          type="date"
          tooltip="Fecha en la que el socio inició su primera membresía."
        />
        <NFField 
          name="branchName" 
          label="Sede Principal" 
          icon={MapPin}
          placeholder="Ej. Club Central"
          tooltip="Gimnasio donde el socio entrena habitualmente."
        />
      </div>
    </NFCard>
  )
}
