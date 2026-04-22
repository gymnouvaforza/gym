"use client";

import { useOptimistic, useTransition, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { countLeadsByStatus } from "@/lib/admin-dashboard";
import type { Lead } from "@/lib/supabase/database.types";
import { formatShortDate } from "@/lib/utils";

import DashboardEmptyState from "./DashboardEmptyState";
import LeadDetailsDialogTrigger from "./LeadDetailsDialogTrigger";
import LeadStatusSelect from "./LeadStatusSelect";
import { 
  User, 
  MessageSquare, 
  Activity, 
  Globe, 
  Eye,
  Inbox,
  CheckCircle2,
  PhoneCall,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { deleteLeadAction } from "@/app/(admin)/dashboard/actions";
import { DeleteConfirmDialog } from "@/features/admin/components/shared/delete-confirm-dialog";

interface LeadsTableProps {
  leads: Lead[];
  disabledReason?: string;
  hasActiveFilters?: boolean;
}

export default function LeadsTable({
  leads,
  disabledReason,
  hasActiveFilters = false,
}: LeadsTableProps) {
  const [, startTransition] = useTransition();
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);

  const [optimisticLeads, deleteOptimisticLead] = useOptimistic(
    leads,
    (state, idToRemove: string) => state.filter((l) => l.id !== idToRemove)
  );

  const handleDeleteConfirm = () => {
    if (!leadToDelete) return;
    
    const id = leadToDelete.id;
    setLeadToDelete(null);

    startTransition(async () => {
      deleteOptimisticLead(id);
      try {
        await deleteLeadAction(id);
        toast.success("Prospecto eliminado del sistema.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Error al eliminar.");
      }
    });
  };

  if (!optimisticLeads.length) {
    return (
      <DashboardEmptyState
        title={hasActiveFilters ? "No hay resultados para estos filtros" : "Todavia no hay leads"}
        description={
          hasActiveFilters
            ? "Prueba con otra busqueda o limpia los filtros para volver a ver toda la bandeja."
            : "Cuando alguien complete el formulario publico, aparecera aqui con su estado y fecha de entrada."
        }
        actionHref={hasActiveFilters ? undefined : "/#contacto"}
        actionLabel={hasActiveFilters ? undefined : "Probar formulario publico"}
      />
    );
  }

  const leadSummary = countLeadsByStatus(optimisticLeads);

  return (
    <div className="space-y-8">
      <DeleteConfirmDialog
        isOpen={!!leadToDelete}
        onClose={() => setLeadToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="¿Eliminar este prospecto?"
        description={`Esta acción no se puede deshacer. Se eliminará permanentemente a ${leadToDelete?.name || ''} del sistema comercial.`}
      />

      {/* Resumen Premium */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="bg-white border border-black/5 p-6 rounded-2xl shadow-xl shadow-black/[0.01] group hover:border-amber-500/20 transition-all duration-500">
          <div className="flex items-center gap-3 mb-4">
             <div className="size-8 rounded-xl bg-amber-50 flex items-center justify-center">
                <Inbox className="size-4 text-amber-600" />
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87] group-hover:text-amber-600 transition-colors">
               Nuevos
             </p>
          </div>
          <p className="text-3xl font-black text-[#111111] tracking-tighter">{leadSummary.new}</p>
        </div>

        <div className="bg-white border border-black/5 p-6 rounded-2xl shadow-xl shadow-black/[0.01] group hover:border-blue-500/20 transition-all duration-500">
          <div className="flex items-center gap-3 mb-4">
             <div className="size-8 rounded-xl bg-blue-50 flex items-center justify-center">
                <PhoneCall className="size-4 text-blue-600" />
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87] group-hover:text-blue-600 transition-colors">
               Contactados
             </p>
          </div>
          <p className="text-3xl font-black text-[#111111] tracking-tighter">{leadSummary.contacted}</p>
        </div>

        <div className="bg-white border border-black/5 p-6 rounded-2xl shadow-xl shadow-black/[0.01] group hover:border-emerald-500/20 transition-all duration-500">
          <div className="flex items-center gap-3 mb-4">
             <div className="size-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 className="size-4 text-emerald-600" />
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87] group-hover:text-emerald-600 transition-colors">
               Cerrados
             </p>
          </div>
          <p className="text-3xl font-black text-[#111111] tracking-tighter">{leadSummary.closed}</p>
        </div>
      </div>

      {/* Vista Mobile Premium */}
      <div className="space-y-4 md:hidden">
        {optimisticLeads.map((lead) => (
          <div key={lead.id} className="bg-white border border-black/5 p-6 rounded-2xl shadow-lg shadow-black/[0.02] space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-black text-[#111111] tracking-tight uppercase text-sm">{lead.name}</p>
                <p className="text-xs font-medium text-[#7a7f87] lowercase">{lead.email}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-[#7a7f87] uppercase tracking-widest mb-1">{formatShortDate(lead.created_at)}</p>
                <span className="inline-flex px-2 py-0.5 bg-black/[0.03] border border-black/5 text-[9px] font-bold uppercase tracking-widest text-[#7a7f87] rounded">
                  {lead.source}
                </span>
              </div>
            </div>
            
            <p className="text-xs leading-relaxed text-[#5f6368] bg-black/[0.01] p-3 rounded-xl border border-black/5 italic">
              &quot;{lead.message}&quot;
            </p>

            <div className="flex items-center justify-between gap-4 pt-2">
              <LeadStatusSelect
                leadId={lead.id}
                currentStatus={lead.status}
                disabledReason={disabledReason}
              />
              <div className="flex items-center gap-2">
                <LeadDetailsDialogTrigger lead={lead} disabledReason={disabledReason} />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  disabled={Boolean(disabledReason)} 
                  onClick={() => setLeadToDelete(lead)}
                  className="h-8 w-8 text-[#7a7f87] hover:text-[#d71920] hover:bg-red-50"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabla Desktop Premium */}
      <div className="hidden md:block overflow-hidden rounded-[1.5rem] border border-black/5 shadow-2xl shadow-black/[0.03] bg-white">
        <Table className="min-w-[800px]">
          <TableHeader className="bg-black/[0.02]">
            <TableRow className="hover:bg-transparent border-black/5">
              <TableHead className="h-14 font-black text-[10px] uppercase tracking-widest text-[#111111] px-6">
                <div className="flex items-center gap-2">
                  <User className="size-3 text-[#d71920]" />
                  <span>Prospecto</span>
                </div>
              </TableHead>
              <TableHead className="h-14 font-black text-[10px] uppercase tracking-widest text-[#111111]">
                <div className="flex items-center gap-2">
                  <MessageSquare className="size-3 text-[#d71920]" />
                  <span>Mensaje de Interés</span>
                </div>
              </TableHead>
              <TableHead className="h-14 font-black text-[10px] uppercase tracking-widest text-[#111111]">
                <div className="flex items-center gap-2">
                  <Activity className="size-3 text-[#d71920]" />
                  <span>Estado Comercial</span>
                </div>
              </TableHead>
              <TableHead className="h-14 font-black text-[10px] uppercase tracking-widest text-[#111111]">
                <div className="flex items-center gap-2">
                  <Globe className="size-3 text-[#d71920]" />
                  <span>Origen</span>
                </div>
              </TableHead>
              <TableHead className="h-14 font-black text-[10px] uppercase tracking-widest text-[#111111] text-right px-6">
                <div className="flex items-center justify-end gap-2">
                  <Eye className="size-3 text-[#d71920]" />
                  <span>Detalle</span>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {optimisticLeads.map((lead) => (
              <TableRow key={lead.id} className="group hover:bg-black/[0.01] transition-all duration-300 border-black/[0.03]">
                <TableCell className="px-6 py-5">
                  <p className="font-black text-[#111111] tracking-tight uppercase text-xs">{lead.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-[10px] font-medium text-[#7a7f87]">{lead.email}</p>
                    {lead.phone && (
                       <>
                         <span className="text-black/10 text-[10px]">•</span>
                         <p className="text-[10px] font-bold text-[#111111]/60">{lead.phone}</p>
                       </>
                    )}
                  </div>
                </TableCell>
                <TableCell className="max-w-md py-5">
                  <p className="truncate text-xs font-medium text-[#5f6368] leading-relaxed italic" title={lead.message}>
                    &quot;{lead.message}&quot;
                  </p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-black/20 mt-1.5">{formatShortDate(lead.created_at)}</p>
                </TableCell>
                <TableCell className="py-5">
                  <LeadStatusSelect
                    leadId={lead.id}
                    currentStatus={lead.status}
                    disabledReason={disabledReason}
                  />
                </TableCell>
                <TableCell className="py-5">
                  <span className="inline-flex px-2.5 py-1 bg-black/[0.03] border border-black/5 text-[9px] font-black uppercase tracking-[0.2em] text-[#7a7f87] rounded-md transition-colors group-hover:bg-white group-hover:border-black/10">
                    {lead.source}
                  </span>
                </TableCell>
                <TableCell className="text-right px-6 py-5">
                  <div className="flex items-center justify-end gap-1">
                    <LeadDetailsDialogTrigger lead={lead} disabledReason={disabledReason} />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      disabled={Boolean(disabledReason)} 
                      onClick={() => setLeadToDelete(lead)}
                      className="h-8 w-8 text-[#7a7f87] hover:text-[#d71920] hover:bg-red-50 rounded-full transition-all"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
