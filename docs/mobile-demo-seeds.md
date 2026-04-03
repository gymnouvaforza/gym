# Mobile Demo Seeds

Estado actual:

- La app mobile ya permite probar UX con escenarios mock seleccionables dentro de la propia app.
- El dominio real de `miembros / planes / rutinas` todavia no existe como modulo persistente en Supabase.
- Por eso los usuarios demo reales sirven para login y roles, pero los estados de `plan`, `rutina` e `historial` siguen mockeados desde la capa mobile.

Usuarios demo recomendados para Antigravity:

- `entrenador@novaforza.com`
- `usuario1@novaforza.com`
- `usuario2@novaforza.com`
- `usuario3@novaforza.com`

Variables sugeridas para el proyecto mobile:

- `apps/mobile/.env.local`
- plantilla en `apps/mobile/.env.example`

Reglas:

- `entrenador@novaforza.com` debe recibir el rol persistente `trainer` en `public.user_roles`.
- `usuario1@novaforza.com`, `usuario2@novaforza.com` y `usuario3@novaforza.com` quedan como cuentas miembro normales.
- Si se quieren ver variantes de `plan`, `sin ficha`, `sin rutina` o `lista vacia`, usa el selector mock del cliente mobile.

Seed SQL incluido:

- [mobile-demo-users.sql](/C:/digitalbitsolutions/gym/supabase/sql/mobile-demo-users.sql)

Que hace el SQL:

- Si los usuarios ya existen en `auth.users`, crea o actualiza sus filas en `public.member_commerce_customers`.
- Si existe `entrenador@novaforza.com`, le asigna tambien el rol `trainer` en `public.user_roles`.
- No intenta crear passwords ni insertar directamente en `auth.users`, porque eso depende de la estrategia de provisioning que use Antigravity o Supabase Auth.

Checklist para Antigravity:

1. Crear los cuatro usuarios en Supabase Auth.
2. Ejecutar `supabase/sql/mobile-demo-users.sql`.
3. Verificar que `entrenador@novaforza.com` quedo con rol `trainer` en `public.user_roles`.
4. Probar login mobile con cada cuenta.
5. Usar el selector mock del cliente para revisar estados UX.
