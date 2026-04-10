# Matriz de cierre del core `#12-#16`

Estado de referencia para cerrar las epics del core sin reabrir trabajo ya absorbido por el repo.

## Criterio

- `ya cubierto`: existe implementacion o artefacto suficiente en repo
- `requiere ajuste`: habia drift o legacy real y se corrige en esta pasada
- `verificado y cerrable`: existe comportamiento, evidencia automatizada y documentacion alineada

## `#12` Baseline del producto real

| Issue | Estado | Evidencia principal | Accion |
| --- | --- | --- | --- |
| `#18` Docs core reales | verificado y cerrable | `README.md`, `AGENTS.md`, `docs/product-snapshot.md` | cerrar al merge |
| `#19` Cleanup legacy | requiere ajuste | `docs/legacy-audit-phase-0.md`, retirada de `src/app/[locale]`, limpieza de `src/data/*`, retirada del CRUD legacy de tienda en Supabase | cerrar al merge |
| `#20` Smoke checklist | verificado y cerrable | `docs/core-smoke-checklist.md` | cerrar al merge |

## `#13` Contenido comercial editable

| Issue | Estado | Evidencia principal | Accion |
| --- | --- | --- | --- |
| `#21` Planes editables | verificado y cerrable | `src/app/(admin)/dashboard/marketing/page.tsx`, `src/app/(public)/page.tsx`, `src/app/(public)/planes/page.tsx` | cerrar al merge |
| `#22` Horarios editables | verificado y cerrable | `src/app/(admin)/dashboard/marketing/page.tsx`, `src/app/(public)/page.tsx`, `src/app/(public)/horarios/page.tsx` | cerrar al merge |
| `#23` Rutas publicas `/planes` y `/horarios` | verificado y cerrable | rutas publicas activas + smoke dedicado | cerrar al merge |
| `#24` Discovery marketing fase 2 | verificado y cerrable | `docs/marketing-cms-discovery-phase-1.md` | cerrar al merge sin implementar `#42` |

## `#14` Leads v2

| Issue | Estado | Evidencia principal | Accion |
| --- | --- | --- | --- |
| `#25` Busqueda, filtros y orden | verificado y cerrable | `src/app/(admin)/dashboard/leads/page.tsx`, `src/components/admin/LeadsToolbar.tsx`, `tests/e2e/dashboard-leads.spec.ts` | cerrar al merge |
| `#26` Detalle de lead | verificado y cerrable | `src/components/admin/LeadDetailsDialogTrigger.tsx`, tests del dialog y smoke e2e | cerrar al merge |
| `#27` Seguimiento comercial minimo | verificado y cerrable | migracion `202603290001_add_lead_follow_up.sql`, `LeadFollowUpForm`, `updateLeadFollowUpRecord` | cerrar al merge |
| `#28` Exportacion simple | verificado y cerrable | `src/app/api/dashboard/leads/export/route.ts`, toolbar del dashboard | cerrar al merge |

## `#15` Store + pickup hardening

| Issue | Estado | Evidencia principal | Accion |
| --- | --- | --- | --- |
| `#29` Bandeja de pedidos pickup | verificado y cerrable | `src/app/(admin)/dashboard/tienda/pedidos/page.tsx`, timeline y acciones rapidas | cerrar al merge |
| `#30` Detalle privado de pedido | verificado y cerrable | `src/app/(public)/mi-cuenta/pedidos/[id]/page.tsx` | cerrar al merge |
| `#31` Bridge miembro-carrito-pickup | verificado y cerrable | suite `src/lib/cart/__tests__/member-bridge.test.ts` y `paypal-checkout.test.ts` | cerrar al merge |
| `#32` Runbook de reconciliacion | verificado y cerrable | `docs/store-pickup-reconciliation-runbook.md` | cerrar al merge |
| `#33` UX de estados checkout | verificado y cerrable | `CartPageClient`, `CartProcessingPageClient`, confirmacion y tests de checkout | cerrar al merge |

## `#16` Mi cuenta v2

| Issue | Estado | Evidencia principal | Accion |
| --- | --- | --- | --- |
| `#34` Ajustes basicos de cuenta | verificado y cerrable | `src/app/(public)/mi-cuenta/page.tsx` | cerrar al merge |
| `#35` Frontera auth vs miembros | verificado y cerrable | `docs/auth-vs-miembros-boundary.md` | cerrar al merge |
| `#36` Backlog corto de mi-cuenta | verificado y cerrable | `docs/mi-cuenta-core-backlog.md` | cerrar al merge |

## Gate de cierre

Antes de cerrar cualquier issue de esta matriz:

1. `npm run lint`
2. `npm run typecheck`
3. `npm run test`
4. `npm run build`

Si el comportamiento ya existe pero falla alguno de esos gates, la issue vuelve a `requiere ajuste`.
