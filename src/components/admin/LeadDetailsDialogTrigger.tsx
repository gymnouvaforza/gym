"use client";

import { Mail, MessageSquareText, Phone, Tag, User, Calendar, Target, Globe, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getLeadMetadataEntries } from "@/lib/data/leads";
import type { Lead } from "@/lib/supabase/database.types";
import { formatShortDate } from "@/lib/utils";

import LeadFollowUpForm from "./LeadFollowUpForm";
import LeadStatusBadge from "./LeadStatusBadge";
import LeadStatusSelect from "./LeadStatusSelect";
import { cn } from "@/lib/utils";

interface LeadDetailsDialogTriggerProps {
  lead: Lead;
  disabledReason?: string;
}

function DetailItem({
  icon: Icon,
  label,
  value,
  className
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-black/5 bg-white p-5 shadow-sm group hover:border-[#d71920]/20 transition-all duration-500", className)}>
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#7a7f87] group-hover:text-[#111111] transition-colors mb-3">
        <Icon className="size-3.5" />
        <span>{label}</span>
      </div>
      <p className="text-sm font-bold text-[#111111] break-all">{value}</p>
    </div>
  );
}

export default function LeadDetailsDialogTrigger({
  lead,
  disabledReason,
}: LeadDetailsDialogTriggerProps) {
  const metadataEntries = getLeadMetadataEntries(lead.metadata);
  const phone = lead.phone || "Sin teléfono registrado";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          className="h-9 px-4 rounded-xl border-black/10 font-black uppercase text-[10px] tracking-widest hover:bg-black hover:text-white transition-all shadow-sm"
        >
          Ver expediente
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[95vh] max-w-4xl overflow-y-auto rounded-[2rem] p-0 border-none shadow-2xl gap-0">
        <DialogTitle className="sr-only">Expediente de prospecto: {lead.name}</DialogTitle>
        {/* ENCABEZADO PREMIUM */}
        <div className="relative overflow-hidden bg-[#111111] px-8 py-10 text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#d71920]/10 blur-3xl -mr-32 -mt-32 rounded-full" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="size-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                <User className="size-8 text-[#d71920]" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h2 className="text-3xl font-black tracking-tighter uppercase">{lead.name}</h2>
                  <LeadStatusBadge status={lead.status} />
                </div>
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                   <Globe className="size-3" />
                   <span>{lead.source}</span>
                   <span className="size-1 rounded-full bg-white/20" />
                   <Calendar className="size-3" />
                   <span>Recibido {formatShortDate(lead.created_at)}</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:block text-right">
               <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">ID Único</p>
               <p className="text-xs font-mono text-white/60 bg-white/5 px-3 py-1 rounded-lg border border-white/5">{lead.id.slice(0, 13).toUpperCase()}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#fbfbf8] px-8 py-10 space-y-12">
          {/* INFORMACIÓN DE CONTACTO */}
          <div className="grid gap-6 md:grid-cols-2">
            <DetailItem icon={Mail} label="Correo Electrónico" value={lead.email} />
            <DetailItem icon={Phone} label="Canal Telefónico" value={phone} />
          </div>

          {/* MENSAJE DE INTERÉS */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-xl bg-white flex items-center justify-center border border-black/5 shadow-sm">
                <MessageSquareText className="size-4 text-[#d71920]" />
              </div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#111111]">Intención del Prospecto</h3>
              <div className="h-px flex-1 bg-black/5" />
            </div>
            <div className="rounded-[1.5rem] border border-black/5 bg-white p-8 shadow-sm">
              <div className="inline-flex px-3 bg-[#d71920] text-white text-[9px] font-black uppercase tracking-widest rounded-full h-6 items-center mb-6">
                 Mensaje Directo
              </div>
              <p className="whitespace-pre-wrap text-base font-medium leading-8 text-[#111111]/80 italic">
                &ldquo;{lead.message}&rdquo;
              </p>
            </div>
          </section>

          {/* BITÁCORA COMERCIAL FULL-SIZE */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-xl bg-[#111111] flex items-center justify-center shadow-lg">
                <Target className="size-4 text-[#d71920]" />
              </div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#111111]">Gestión y Seguimiento Comercial</h3>
              <div className="h-px flex-1 bg-black/5" />
            </div>

            <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
              <div className="space-y-4">
                <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
                  <p className="text-[9px] font-black uppercase tracking-widest text-[#7a7f87] mb-4">Estatus Actual</p>
                  <LeadStatusSelect
                    leadId={lead.id}
                    currentStatus={lead.status}
                    disabledReason={disabledReason}
                  />
                </div>
                <div className="p-6 rounded-2xl bg-amber-50/50 border border-amber-200/50">
                   <p className="text-[9px] font-black uppercase tracking-widest text-amber-700 mb-2">Recordatorio</p>
                   <p className="text-[10px] font-medium text-amber-900/70 leading-relaxed">
                     Actualiza el estado cada vez que realices un avance en la negociación.
                   </p>
                </div>
              </div>
              
              <div className="min-w-0">
                <LeadFollowUpForm lead={lead} disabledReason={disabledReason} />
              </div>
            </div>
          </section>

          {/* METADATOS TÉCNICOS */}
          <section className="pt-6 border-t border-black/5">
            <div className="flex items-center gap-3 mb-6">
              <Tag className="size-3.5 text-[#7a7f87]" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#7a7f87]">Detalles de Captura</h3>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-black/[0.02] p-4 rounded-xl border border-black/5">
                <p className="text-[8px] font-black uppercase text-[#7a7f87] mb-1">Origen</p>
                <p className="text-xs font-bold text-[#111111] uppercase tracking-tighter">{lead.source}</p>
              </div>
              <div className="bg-black/[0.02] p-4 rounded-xl border border-black/5">
                <p className="text-[8px] font-black uppercase text-[#7a7f87] mb-1">Recibido</p>
                <p className="text-xs font-bold text-[#111111] uppercase tracking-tighter">{formatShortDate(lead.created_at)}</p>
              </div>
              {metadataEntries.map((entry) => (
                <div key={entry.key} className="bg-black/[0.02] p-4 rounded-xl border border-black/5">
                  <p className="text-[8px] font-black uppercase text-[#7a7f87] mb-1">{entry.label}</p>
                  <p className="text-xs font-bold text-[#111111] uppercase tracking-tighter truncate" title={entry.value}>{entry.value}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
        
        {/* FOOTER DE CIERRE */}
        <div className="border-t border-black/5 bg-white px-8 py-6 flex justify-end">
           <Button 
             variant="ghost" 
             onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}))}
             className="text-[10px] font-black uppercase tracking-widest text-[#7a7f87] hover:text-[#111111] hover:bg-black/5"
           >
             Cerrar Expediente
           </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
