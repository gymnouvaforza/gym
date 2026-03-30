import { NextRequest, NextResponse } from "next/server";

import { getCurrentAdminUser } from "@/lib/auth";
import { filterAndSortLeads, parseLeadFilters, serializeLeadsToCsv } from "@/lib/data/leads";
import { hasSupabaseServiceRole } from "@/lib/env";
import { normalizeLeads } from "@/lib/supabase/queries";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

function buildCsvFilename() {
  return `leads-export-${new Date().toISOString().slice(0, 10)}.csv`;
}

export async function GET(request: NextRequest) {
  const adminUser = await getCurrentAdminUser();

  if (!adminUser) {
    return NextResponse.json({ error: "Necesitas una sesion admin para exportar leads." }, { status: 401 });
  }

  if (!hasSupabaseServiceRole()) {
    return NextResponse.json(
      { error: "Configura SUPABASE_SERVICE_ROLE_KEY para exportar leads reales." },
      { status: 503 },
    );
  }

  const filters = parseLeadFilters(Object.fromEntries(request.nextUrl.searchParams.entries()));
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "No se pudieron cargar los leads para exportar." }, { status: 500 });
  }

  const leads = filterAndSortLeads(normalizeLeads(data), filters);
  const csv = serializeLeadsToCsv(leads);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=\"${buildCsvFilename()}\"`,
      "Cache-Control": "no-store",
    },
  });
}
