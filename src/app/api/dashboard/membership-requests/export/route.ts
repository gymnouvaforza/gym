import { NextResponse } from "next/server";

import { requireRoles, withApiErrorHandling } from "@/lib/api-utils";
import {
  filterAndSortMembershipRequests,
  parseMembershipRequestFilters,
} from "@/lib/data/membership-request-dashboard";
import { listMembershipRequests } from "@/lib/data/memberships";
import { DASHBOARD_ADMIN_ROLE, SUPERADMIN_ROLE } from "@/lib/user-roles";

function escapeCsv(value: string | number | null | undefined) {
  if (value === null || typeof value === "undefined") {
    return "";
  }

  const normalized = String(value);

  if (/[",\n]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }

  return normalized;
}

export async function GET(request: Request) {
  return withApiErrorHandling(async () => {
    const auth = await requireRoles([DASHBOARD_ADMIN_ROLE, SUPERADMIN_ROLE]);
    if (!auth.success) return auth.errorResponse;

    const url = new URL(request.url);
    const filters = parseMembershipRequestFilters(
      Object.fromEntries(url.searchParams.entries()),
    );
    const requests = await listMembershipRequests({
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
      q: filters.q || undefined,
      status: filters.status === "all" ? undefined : filters.status,
    });
    const filtered = filterAndSortMembershipRequests(requests, filters);

    const rows = [
      [
        "request_number",
        "member_number",
        "member_name",
        "email",
        "plan_title",
        "request_status",
        "validation_status",
        "manual_payment_status",
        "medusa_sync_status",
        "medusa_product_id",
        "medusa_variant_id",
        "medusa_cart_id",
        "medusa_order_id",
        "medusa_sync_error",
        "medusa_synced_at",
        "price_amount",
        "manual_paid_total",
        "manual_balance_due",
        "cycle_starts_on",
        "cycle_ends_on",
        "created_at",
        "updated_at",
      ].join(","),
      ...filtered.map((request) =>
        [
          escapeCsv(request.requestNumber),
          escapeCsv(request.member.memberNumber),
          escapeCsv(request.member.fullName),
          escapeCsv(request.email),
          escapeCsv(request.planTitleSnapshot),
          escapeCsv(request.status),
          escapeCsv(request.validation.status),
          escapeCsv(request.manualPaymentSummary.status),
          escapeCsv(request.commerce.syncStatus),
          escapeCsv(request.commerce.productId),
          escapeCsv(request.commerce.variantId),
          escapeCsv(request.commerce.cartId),
          escapeCsv(request.commerce.orderId),
          escapeCsv(request.commerce.syncError),
          escapeCsv(request.commerce.syncedAt),
          escapeCsv(request.priceAmount.toFixed(2)),
          escapeCsv(request.manualPaymentSummary.paidTotal.toFixed(2)),
          escapeCsv(request.manualPaymentSummary.balanceDue.toFixed(2)),
          escapeCsv(request.cycleStartsOn),
          escapeCsv(request.cycleEndsOn),
          escapeCsv(request.createdAt),
          escapeCsv(request.updatedAt),
        ].join(","),
      ),
    ];

    return new NextResponse(rows.join("\n"), {
      headers: {
        "Content-Disposition": `attachment; filename="membership-requests-${new Date().toISOString().slice(0, 10)}.csv"`,
        "Content-Type": "text/csv; charset=utf-8",
      },
    });
  });
}
