# Nova Forza

Base de producto para el gimnasio **Nova Forza** con dos superficies activas:

- web publica en `src/app/(public)`
- backoffice interno en `src/app/(admin)/dashboard`

La capa commerce entra ahora en una migracion progresiva hacia **Medusa + Next.js**, manteniendo **Supabase** como infraestructura PostgreSQL cuando encaja.

## Arquitectura actual

- `Next.js 16` y `React 19` para storefront y panel interno
- `Supabase` para auth, leads, ajustes globales y resto de dominio propio
- `apps/medusa` como backend de comercio separado

Mas detalle en [docs/commerce-medusa-migration.md](/C:/digitalbitsolutions/gym/docs/commerce-medusa-migration.md).

## Frontera de responsabilidades

### Next.js + Supabase propio

- marketing
- contenido
- login
- dashboard
- leads
- ajustes del sitio
- modulos del gimnasio no-commerce

### Medusa

- productos
- categorias
- precios
- inventario base
- futura base para carrito y checkout

## Desarrollo local

### Storefront y panel

```bash
npm install
npm run dev
```

### Backend commerce

```bash
npm --prefix apps/medusa install
npm run dev:medusa
```

## Variables de entorno

Completa `.env.local` a partir de `.env.example`.

### Propias del proyecto actual

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_ALLOWED_EMAILS`
- `ADMIN_USER`
- `ADMIN_PASSWORD`

### Nuevas para commerce

- `COMMERCE_PROVIDER=medusa`
- `STORE_ADMIN_PROVIDER=medusa`
- `COMMERCE_CURRENCY_CODE=PEN`
- `COMMERCE_LOCALE=es-PE`
- `NEXT_PUBLIC_COMMERCE_CURRENCY_CODE=PEN`
- `NEXT_PUBLIC_COMMERCE_LOCALE=es-PE`
- `MEDUSA_BACKEND_URL`
- `MEDUSA_ADMIN_API_KEY`
- `MEDUSA_PUBLISHABLE_KEY`
- `MEDUSA_REGION_ID`
- `MEDUSA_REGION_NAME=Peru`
- `MEDUSA_COUNTRY_CODE=PE`

El runtime de commerce ya no admite fallback a Supabase ni a catalogo local. Si Medusa no responde,
la tienda y el dashboard muestran un error explicito.

Por defecto el proyecto queda preparado para trabajar en **sol peruano (`PEN`)** y locale
`es-PE`, pero puedes cambiarlo por entorno sin tocar codigo.

## Supabase y Medusa

Medusa debe conectarse a PostgreSQL por `DATABASE_URL` directa. No usa el cliente JS de Supabase para resolver comercio.

La recomendacion operativa mas segura es:

- usar **Supabase Postgres** para Medusa
- mantener **Medusa** como propietario de sus tablas
- evitar mezclar tablas internas de Medusa con el dominio del gym sin una frontera clara
- usar Supabase tambien para persistir los IDs puente `medusa_category_id` y `medusa_product_id`

## Seeds de comercio

La app Medusa incluye un seed inicial de Nova Forza:

```bash
npm run medusa:seed:nova
```

Ese seed deja la base para catalogo, categorias, stock simple y la publishable key del storefront.
Los datos locales ya no alimentan la app en runtime; si se conservan, quedan solo como fixtures o
material de seed.

## Deploy y preproduccion

La ruta operativa recomendada para este repo es desplegar `web` y `Medusa` en el mismo VPS usando Docker y Dokploy, manteniendo `Supabase` como base de datos y storage externos.

La receta completa esta documentada en [docs/dokploy-full-stack.md](/C:/digitalbitsolutions/gym/docs/dokploy-full-stack.md).

## QA

Antes de cerrar cambios relevantes:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```
