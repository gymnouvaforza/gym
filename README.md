# Nova Forza Gym - Base de Producto

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?logo=firebase&logoColor=black)
![Supabase](https://img.shields.io/badge/Supabase-Runtime-3ECF8E?logo=supabase&logoColor=white)
![Medusa](https://img.shields.io/badge/Medusa-v2-111827)

Ecosistema integral para gimnasios locales que combina una web publica comercial, un panel operativo propio y una infraestructura escalable basada en Firebase Auth, Supabase y Medusa v2.

## Lo que incluye hoy

### Web publica y marketing
- **Home comercial** con secciones de testimonios, zonas y equipo.
- **CMS de marketing** para planes, horarios y resenas.
- **Leads** y formularios comerciales.

### E-commerce operativo
- **Tienda publica** gestionada por Medusa v2.
- **Carrito y checkout pickup** con PayPal.
- **Cuenta de socio** con historial y perfil.

### Backoffice
- **Dashboard propio** que orquesta Firebase Auth, Supabase y Medusa.
- **Miembros, rutinas y CMS** desde la misma interfaz.
- **CRUD de tienda** via Medusa Admin API con puentes persistidos en Supabase.

### App movil
- **Nova Forza Mobile** en `apps/mobile`, consumiendo el mismo backend.

## Vistas del producto

### Web publica y tienda
| Portada (Desktop) | Tienda / Catalogo | Checkout / Carrito |
| --- | --- | --- |
| ![Home publica](.github/assets/readme/home-public.png) | ![Tienda publica](.github/assets/readme/storefront-shop.png) | ![Checkout pickup](.github/assets/readme/pickup-checkout.png) |

### Panel de administracion
| Dashboard Overview | Gestion de Leads | Gestion de Tienda |
| --- | --- | --- |
| ![Dashboard overview](.github/assets/readme/dashboard-overview.png) | ![Dashboard leads](.github/assets/readme/dashboard-leads.png) | ![Dashboard tienda](.github/assets/readme/dashboard-store.png) |

### Area del socio y movil
| Mi Cuenta | Home (Mobile) |
| --- | --- |
| ![Mi cuenta](.github/assets/readme/account.png) | ![Home mobile](.github/assets/readme/home-mobile.png) |

## Arquitectura

- **Next.js 16 + React 19**: UI principal, RSC, rutas y server actions.
- **Firebase Auth**: identidad unica para socios y backoffice, con cookie HTTP-only replicada para SSR.
- **Supabase**: PostgreSQL, Storage, Edge Functions y datos de dominio.
- **Medusa v2**: catalogo, pedidos y flujo de tienda.
- **Tailwind CSS v4**: estilos y sistema visual.

Mas detalle en [docs/architecture.md](docs/architecture.md).

## Desarrollo local

### Requisitos
- Node.js 20+
- Docker para Medusa y Redis

### Puesta en marcha

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Levantar backend commerce:
   ```bash
   npm run dev:backend
   ```
3. Levantar Next.js:
   ```bash
   npm run dev
   ```
4. App movil opcional:
   ```bash
   npm run dev:mobile
   ```

## Variables de entorno

Usa `.env.example` como plantilla para `.env.local`. La app requiere:

- Firebase Auth publico y admin
- Supabase runtime y service role
- Medusa publishable key y admin API key
- SMTP propio para verify email, reset password y verify-and-change-email

Migracion de usuarios:

```bash
npm run auth:migrate:firebase
```

Ese script crea o empareja usuarios en Firebase, conserva `emailVerified` cuando es posible y reescribe referencias enlazadas en Supabase hacia el nuevo `uid`.

## Produccion

Topologia actual:

- `https://nuovaforzagym.com` -> frontend Next.js en Vercel
- `https://gym.yampi.eu` -> backend Medusa en Dokploy/VPS
- `redis` -> servicio interno de Medusa

Next.js debe apuntar a Medusa usando `NEXT_PUBLIC_MEDUSA_BACKEND_URL` y `MEDUSA_BACKEND_URL`.

## Documentacion

- [Manual de usuario](docs/manual-usuario.md)
- [Arquitectura del sistema](docs/architecture.md)
- [Runbook de reconciliacion](docs/archive/store-pickup-reconciliation-runbook.md)

---
Construido por Digitalbit Solutions para un fitness mas digital.
