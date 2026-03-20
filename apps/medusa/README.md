# Nova Forza Commerce Backend

Backend de comercio de **Nova Forza** basado en **Medusa v2**.

## Rol en la arquitectura

- `apps/medusa`: dominio commerce puro
- `src/app/(public)/tienda`: storefront principal en Next.js
- `Supabase`: Postgres para Medusa mediante `DATABASE_URL` directa, no via SDK frontend

## Alcance de esta fase

- catalogo de productos
- categorias base
- precios
- inventario simple
- base para carrito y checkout posteriores

Queda fuera por ahora:

- pagos
- checkout completo
- promociones
- clientes complejos
- backoffice custom del gym

## Variables de entorno

Duplica `apps/medusa/.env.template` a `apps/medusa/.env` y completa:

```env
DATABASE_URL=postgresql://...
STORE_CORS=http://localhost:3000,http://localhost:3001
ADMIN_CORS=http://localhost:7001,http://localhost:9000
AUTH_CORS=http://localhost:7001,http://localhost:9000
JWT_SECRET=change-me
COOKIE_SECRET=change-me
```

`DATABASE_URL` debe ser una **conexion PostgreSQL directa de Supabase**, no el cliente JS ni un pooler transaccional pensado para sesiones cortas.

## Desarrollo local

```bash
npm --prefix apps/medusa install
npm run dev:medusa
```

Medusa queda disponible por defecto en `http://localhost:9000`.

## Deploy con Docker

El backend puede desplegarse como contenedor usando [Dockerfile](/C:/digitalbitsolutions/gym/apps/medusa/Dockerfile).

Supuesto recomendado para este proyecto:

- storefront publico en `https://gym.yampi.eu` desde Vercel
- backend Medusa en `https://api.gym.yampi.eu` desde tu VPS/Dokploy

Variables minimas para produccion:

```env
PORT=9000
DATABASE_URL=postgresql://...
MEDUSA_DB_INSECURE_SSL=true
STORE_CORS=https://gym.yampi.eu
ADMIN_CORS=https://gym.yampi.eu,https://api.gym.yampi.eu
AUTH_CORS=https://gym.yampi.eu,https://api.gym.yampi.eu
JWT_SECRET=...
COOKIE_SECRET=...
```

Si usas Supabase Storage/S3 para imagenes, anade tambien:

```env
S3_URL=https://<project-ref>.supabase.co/storage/v1/s3
S3_BUCKET=medusa-media
S3_REGION=eu-central-1
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
```

## Seed Nova Forza

El script `seed:nova` crea una base minima alineada con la tienda actual:

- canal de venta `Nova Forza Storefront`
- region `Peru`
- stock location `Nova Forza Club`
- categorias `Suplementos`, `Accesorios`, `Merchandising`
- productos iniciales con metadata pensada para el storefront actual

Ejecucion:

```bash
npm run medusa:seed:nova
```

Al terminar, Medusa deja dos datos clave en logs:

- `region.id`
- `publishable api key`

Ambos se reutilizan en el storefront Next.js.

La moneda y region por defecto del seed son `PEN` / `Peru`, pero pueden ajustarse con:

- `COMMERCE_CURRENCY_CODE`
- `MEDUSA_REGION_NAME`
- `MEDUSA_COUNTRY_CODE`

Guia operativa recomendada para Dokploy/VPS en:

- [docs/medusa-dokploy-vps.md](/C:/digitalbitsolutions/gym/docs/medusa-dokploy-vps.md)

## Nota sobre Supabase

La recomendacion operativa para una sola persona es:

- usar **Supabase como proveedor PostgreSQL**
- dejar que **Medusa sea propietario de sus tablas commerce**
- evitar mezclar tablas custom del gym con tablas internas de Medusa sin una frontera clara

Si quieres compartir el mismo proyecto de Supabase con otras tablas propias, hazlo solo cuando tengas validada una separacion limpia en staging. Si no, usa otro proyecto de Supabase para Medusa y mantienes igualmente el stack alineado.
