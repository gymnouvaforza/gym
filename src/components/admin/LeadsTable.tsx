import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Lead } from "@/lib/supabase/database.types";
import { formatShortDate } from "@/lib/utils";

import DashboardEmptyState from "./DashboardEmptyState";
import LeadStatusSelect from "./LeadStatusSelect";

interface LeadsTableProps {
  leads: Lead[];
  disabledReason?: string;
}

export default function LeadsTable({ leads, disabledReason }: LeadsTableProps) {
  if (!leads.length) {
    return (
      <DashboardEmptyState
        title="Todavia no hay leads"
        description="Cuando alguien complete el formulario publico, aparecera aqui con su estado y fecha de entrada."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Telefono</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Origen</TableHead>
          <TableHead>Fecha</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leads.map((lead) => (
          <TableRow key={lead.id}>
            <TableCell>
              <div>
                <p className="font-medium text-white">{lead.name}</p>
                <p className="mt-1 max-w-xl truncate text-sm text-zinc-400" title={lead.message}>
                  {lead.message}
                </p>
              </div>
            </TableCell>
            <TableCell>{lead.email}</TableCell>
            <TableCell>{lead.phone || "Sin telefono"}</TableCell>
            <TableCell>
              <LeadStatusSelect
                leadId={lead.id}
                currentStatus={lead.status}
                disabledReason={disabledReason}
              />
            </TableCell>
            <TableCell className="uppercase text-zinc-400">{lead.source}</TableCell>
            <TableCell>{formatShortDate(lead.created_at)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
