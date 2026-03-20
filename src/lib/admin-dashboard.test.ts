import {
  buildCommerceMetrics,
  buildDashboardMetrics,
  countLeadsByStatus,
  getCommerceSourceMeta,
  getLeadStatusMeta,
  getTopbarStatusMeta,
} from "@/lib/admin-dashboard";
import { defaultLeads } from "@/lib/data/default-content";
import { products as fixtureProducts } from "@/test/fixtures/products";

describe("admin dashboard helpers", () => {
  it("counts leads by status", () => {
    expect(countLeadsByStatus(defaultLeads)).toEqual({
      new: 1,
      contacted: 1,
      closed: 1,
    });
  });

  it("builds dashboard metrics for the summary cards", () => {
    const metrics = buildDashboardMetrics(defaultLeads, 1);

    expect(metrics).toHaveLength(3);
    expect(metrics[0]).toMatchObject({
      label: "Leads pendientes",
      value: "1",
      tone: "warning",
    });
    expect(metrics[2]).toMatchObject({
      label: "Seguimiento activo",
      value: "67%",
    });
  });

  it("builds commerce metrics for the admin shop summary", () => {
    const metrics = buildCommerceMetrics(fixtureProducts, "medusa");

    expect(metrics).toHaveLength(3);
    expect(metrics[0]).toMatchObject({
      label: "Catalogo visible",
      value: String(fixtureProducts.length),
    });
    expect(metrics[1]).toMatchObject({
      label: "Fuente commerce",
      value: "Medusa activa",
      tone: "success",
    });
  });

  it("marks commerce as blocked when Medusa has an operational warning", () => {
    const metrics = buildCommerceMetrics([], "medusa", {
      warning: "Medusa no responde desde el dashboard.",
    });

    expect(metrics[0]).toMatchObject({
      label: "Catalogo visible",
      tone: "warning",
    });
    expect(metrics[1]).toMatchObject({
      label: "Fuente commerce",
      value: "Medusa bloqueada",
      tone: "warning",
      hint: "Medusa no responde desde el dashboard.",
    });
    expect(metrics[2]).toMatchObject({
      label: "Revision operativa",
      value: "Bloqueada",
      tone: "warning",
    });
  });

  it("maps status copy for lead, topbar and commerce badges", () => {
    expect(getLeadStatusMeta("closed")).toEqual({
      label: "Cerrado",
      tone: "success",
    });
    expect(getTopbarStatusMeta("expired")).toEqual({
      label: "Caducado",
      tone: "warning",
    });
    expect(getCommerceSourceMeta("medusa")).toEqual({
      label: "Medusa activa",
      tone: "success",
      hint:
        "El dashboard propio opera la tienda sobre Medusa y persiste los enlaces operativos en Supabase.",
    });
    expect(
      getCommerceSourceMeta("medusa", {
        warning: "Falta MEDUSA_ADMIN_API_KEY.",
      }),
    ).toEqual({
      label: "Medusa bloqueada",
      tone: "warning",
      hint: "Falta MEDUSA_ADMIN_API_KEY.",
    });
  });
});
