# Issues abiertas de integracion Medusa

Documento corto de handoff para no perder el contexto cuando cambie la sesion.

## Decision ya tomada

- no se usara el dashboard nativo de Medusa como panel del proyecto
- la gestion del negocio y de la tienda pasa por el dashboard propio en `src/app/(admin)/dashboard`
- Supabase sigue siendo la base de datos principal del sistema

## Como encaja Medusa en esta arquitectura

- Medusa aporta motor de catalogo/commerce
- Medusa corre en `apps/medusa`
- Medusa comparte PostgreSQL en Supabase usando `DATABASE_URL` directa
- el dashboard propio habla con Medusa Admin API cuando `STORE_ADMIN_PROVIDER=medusa`
- Supabase mantiene auth, leads, settings y los enlaces de integracion

## Issues abiertas que hay que tener presentes

1. No introducir trabajo nuevo sobre widgets, extensiones o flujos operativos del admin de Medusa salvo peticion explicita.
2. Mantener el dashboard propio como unica interfaz de operacion para categorias y productos.
3. Cualquier cambio de CRUD en Medusa debe seguir sincronizando `medusa_category_id` y `medusa_product_id` en Supabase.
4. No meter fallback silencioso en el dashboard cuando Medusa falle; el error debe ser visible.
5. Si cambia el modelo de datos de tienda, revisar siempre tambien Supabase, porque sigue siendo la base de datos del proyecto.
6. Evitar decisiones de despliegue que dependan de correr Medusa dentro de Vercel; el backend Medusa debe vivir como servicio separado.

## Archivos que concentran esta frontera

- `src/app/(admin)/dashboard/tienda/actions.ts`
- `src/lib/data/store-admin.ts`
- `src/lib/data/store-admin/repository.ts`
- `src/lib/data/store-admin/medusa-repository.ts`
- `src/lib/commerce/catalog.ts`
- `src/lib/commerce/medusa.ts`
- `src/lib/supabase/queries.ts`
- `apps/medusa/medusa-config.ts`

## Regla mental para futuras tareas

Si una tarea toca tienda, piensa asi:

1. La UI de gestion es el dashboard propio.
2. Medusa resuelve commerce.
3. Supabase sigue siendo la base de datos e infraestructura principal.
