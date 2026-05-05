"use client";

// Form section for legacy Excel member fields preserved during migration.
import { Calendar, FileText, HelpCircle, MapPin, Mars, UserRound, Venus } from "lucide-react";
import { useFormContext } from "react-hook-form";

import { NFCard } from "@/components/system/nf-card";
import { NFField } from "@/components/system/nf-field";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MemberLegacySectionProps {
  memberId?: string;
}

export function MemberLegacySection({ memberId }: Readonly<MemberLegacySectionProps>) {
  const { control } = useFormContext();
  const locksExternalCode = Boolean(memberId);

  return (
    <NFCard
      title="Datos del Excel Maestro"
      description="Campos del control legacy del gimnasio."
      className="shadow-sm"
    >
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <NFField
          name="externalCode"
          label="Código Legacy"
          aria-label="Código Legacy"
          icon={FileText}
          placeholder="Ej. 000123"
          showRequired
          readOnly={locksExternalCode}
          aria-readonly={locksExternalCode}
          tooltip="Código original del Excel Maestro. Se bloquea en fichas existentes para evitar romper trazabilidad."
        />

        <NFField
          name="birthDate"
          label="Fecha de Nacimiento"
          aria-label="Fecha de Nacimiento"
          icon={Calendar}
          type="date"
          tooltip="Fecha registrada originalmente en el control legacy."
        />

        <FormField
          control={control}
          name="gender"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <div className="flex items-center gap-2">
                <Mars className="size-3.5 text-muted-foreground/60" />
                <FormLabel className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  Género
                </FormLabel>
                <TooltipProvider>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <HelpCircle className="size-3 cursor-help text-muted-foreground/30 transition-all hover:scale-110 hover:text-foreground" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[200px] border-none bg-secondary p-3 text-[10px] font-bold uppercase tracking-tight text-white">
                      Valor M/F preservado desde el Excel Maestro.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <FormControl>
                  <SelectTrigger
                    aria-label="Género"
                    className="h-12 rounded-xl border-black/5 bg-black/[0.02] px-4 font-bold text-foreground shadow-none transition-all duration-300 focus:ring-0 focus:border-foreground focus:bg-white"
                  >
                    <SelectValue placeholder="Seleccionar género" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-xl border-black/5 shadow-2xl">
                  <SelectItem value="M" className="py-3 text-xs font-bold uppercase">
                    M
                  </SelectItem>
                  <SelectItem value="F" className="py-3 text-xs font-bold uppercase">
                    F
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage className="mt-1.5 text-[9px] font-black uppercase tracking-tighter text-primary" />
            </FormItem>
          )}
        />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <NFField
          name="address"
          label="Dirección"
          aria-label="Dirección"
          icon={MapPin}
          placeholder="Dirección registrada"
          tooltip="Dirección histórica del socio."
        />
        <NFField
          name="districtOrUrbanization"
          label="Distrito / Urbanización"
          aria-label="Distrito / Urbanización"
          icon={MapPin}
          placeholder="Ej. Urb. Central"
          tooltip="Distrito o urbanización usado para reportes legacy."
        />
        <NFField
          name="occupation"
          label="Ocupación"
          aria-label="Ocupación"
          icon={UserRound}
          placeholder="Ej. Estudiante"
          tooltip="Ocupación declarada en la ficha original."
        />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <NFField
          name="preferredSchedule"
          label="Horario Preferido"
          aria-label="Horario Preferido"
          icon={Venus}
          placeholder="Ej. Mañana"
          tooltip="Horario habitual registrado en el Excel Maestro."
        />

        <FormField
          control={control}
          name="legacyNotes"
          render={({ field }) => (
            <FormItem className="space-y-2 md:col-span-2">
              <div className="flex items-center gap-2">
                <FileText className="size-3.5 text-muted-foreground/60" />
                <FormLabel className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  Notas Legacy
                </FormLabel>
              </div>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value ?? ""}
                  aria-label="Notas Legacy"
                  rows={3}
                  placeholder="Notas preservadas desde el control legacy..."
                  className="min-h-24 rounded-xl border-black/5 bg-black/[0.02] px-4 py-3 font-medium leading-relaxed text-foreground shadow-inner transition-all duration-300 placeholder:text-muted-foreground/30 focus-visible:ring-0 focus-visible:border-foreground focus-visible:bg-white"
                />
              </FormControl>
              <FormMessage className="mt-1.5 text-[9px] font-black uppercase tracking-tighter text-primary" />
            </FormItem>
          )}
        />
      </div>
    </NFCard>
  );
}
