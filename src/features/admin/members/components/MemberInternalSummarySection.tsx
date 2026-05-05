import { ClipboardList, Tag, ShieldCheck, Activity, Calendar, FileText, HelpCircle } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { NFCard } from "@/components/system/nf-card";
import { NFField } from "@/components/system/nf-field";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function MemberInternalSummarySection() {
  const { control } = useFormContext();

  return (
    <NFCard 
      title="Resumen Interno" 
      description="Notas de seguimiento y contexto administrativo."
      className="shadow-sm mt-8 border-black/5"
    >
      <div className="border-l-4 border-[#d71920] bg-red-50/30 p-5 mb-10 rounded-r-xl">
        <div className="flex items-center gap-2 mb-1.5">
           <ClipboardList className="size-3.5 text-[#d71920]" />
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d71920]">
             Protocolo de Operación
           </p>
        </div>
        <p className="text-[11px] font-medium leading-relaxed text-[#5f6368]">
          La gestión de pagos y renovaciones se realiza ahora en la pestaña <span className="font-bold text-[#111111] underline decoration-[#d71920]/30 underline-offset-2 cursor-help">Finanzas</span>. Este bloque está reservado para la categorización operativa y notas de comportamiento.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <NFField 
          name="planLabel" 
          label="Etiqueta Interna" 
          icon={Tag}
          showRequired
          tooltip="Identificador visual rápido para el tipo de socio (ej. VIP, BECADO, STAFF)."
          className="lg:col-span-1"
        />
        
        <FormField
          control={control}
          name="planStatus"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-3.5 text-muted-foreground/60" />
                <FormLabel className="text-[10px] font-black uppercase tracking-wider text-[#7a7f87]">Estado Interno</FormLabel>
                <TooltipProvider>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <HelpCircle className="size-3 text-muted-foreground/30 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#111111] text-white border-none p-3 text-[10px] font-bold uppercase">
                      Define si el plan está activo o suspendido internamente.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="h-12 bg-black/[0.02] border-black/5 rounded-xl px-4 font-bold text-[#111111] focus:ring-0 focus:border-[#111111] transition-all">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-xl border-black/5 shadow-2xl">
                  <SelectItem value="active" className="text-xs font-bold uppercase py-3">Active</SelectItem>
                  <SelectItem value="paused" className="text-xs font-bold uppercase py-3">Paused</SelectItem>
                  <SelectItem value="cancelled" className="text-xs font-bold uppercase py-3">Cancelled</SelectItem>
                  <SelectItem value="expired" className="text-xs font-bold uppercase py-3">Expired</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage className="text-[9px] font-black uppercase text-[#d71920]" />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="status"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <div className="flex items-center gap-2">
                <Activity className="size-3.5 text-muted-foreground/60" />
                <FormLabel className="text-[10px] font-black uppercase tracking-wider text-[#7a7f87]">Estado Operativo</FormLabel>
                <TooltipProvider>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <HelpCircle className="size-3 text-muted-foreground/30 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#111111] text-white border-none p-3 text-[10px] font-bold uppercase">
                      Estatus del socio en el ecosistema global del club.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="h-12 bg-black/[0.02] border-black/5 rounded-xl px-4 font-bold text-[#111111] focus:ring-0 focus:border-[#111111] transition-all">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-xl border-black/5 shadow-2xl">
                  <SelectItem value="prospect" className="text-xs font-bold uppercase py-3">Prospect</SelectItem>
                  <SelectItem value="active" className="text-xs font-bold uppercase py-3">Active</SelectItem>
                  <SelectItem value="paused" className="text-xs font-bold uppercase py-3">Paused</SelectItem>
                  <SelectItem value="cancelled" className="text-xs font-bold uppercase py-3">Cancelled</SelectItem>
                  <SelectItem value="former" className="text-xs font-bold uppercase py-3">Former</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage className="text-[9px] font-black uppercase text-[#d71920]" />
            </FormItem>
          )}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 mt-8 pt-8 border-t border-black/5">
        <NFField 
          name="planStartedAt" 
          label="Inicio de Referencia" 
          type="date"
          icon={Calendar}
          tooltip="Fecha de inicio original. Vital para reportes de retención."
        />
      </div>

      <div className="mt-8 pt-8 border-t border-black/5">
        <FormField
          control={control}
          name="notes"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="size-3.5 text-muted-foreground/60" />
                <FormLabel className="text-[10px] font-black uppercase tracking-wider text-[#7a7f87]">Notas del Socio</FormLabel>
              </div>
              <FormControl>
                <Textarea 
                  {...field} 
                  value={field.value ?? ""}
                  placeholder="Escriba aquí incidentes, preferencias especiales o historial de contacto..." 
                  className="min-h-[160px] bg-black/[0.02] border-black/5 rounded-2xl px-5 py-4 font-medium text-[#111111] focus:ring-0 focus:border-[#111111] focus:bg-white transition-all duration-300 placeholder:text-muted-foreground/20 leading-relaxed shadow-inner"
                />
              </FormControl>
              <FormMessage className="text-[9px] font-black uppercase text-[#d71920]" />
            </FormItem>
          )}
        />
      </div>
    </NFCard>
  );
}
