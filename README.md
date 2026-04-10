# Nova Forza Gym - Base de Producto

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase&logoColor=white)
![Medusa](https://img.shields.io/badge/Medusa-v2-111827)

Ecosistema integral para gimnasios locales que combina una web pública comercial de alto impacto, un panel de gestión operativo personalizado y una infraestructura escalable basada en Supabase y Medusa v2.

## 🚀 Lo que incluye hoy

### Web Pública y Marketing
- **Home Comercial**: Diseño premium con secciones de testimonios, zonas y equipo.
- **CMS de Marketing**: Planes, horarios y reseñas editables desde el dashboard.
- **Rutas Propias**: `/planes` y `/horarios` dinámicos desde Supabase.
- **Leads**: Captura de prospectos y flujo comercial.

### E-commerce Operativo (Pickup First)
- **Tienda Pública**: Catálogo gestionado por Medusa v2 con categorías y búsqueda.
- **Flujo de Compra**: Carrito, checkout integrado con PayPal y pedidos tipo "Pickup" (Recojo en tienda).
- **Cuenta de Socio**: Historial de pedidos y gestión de perfil.

### Gestión Administrativa (Backoffice)
- **Dashboard Propio**: Interfaz única que orquesta Supabase y Medusa.
- **Módulo de Miembros**: Registro, control de suscripciones y perfiles de socios.
- **Módulo de Rutinas**: Creación y asignación de rutinas personalizadas.
- **Módulo de Tienda**: Gestión de catálogo, pedidos y sincronización.

### App Móvil
- **Nova Forza Mobile**: App nativa (Expo) para socios (actualmente en `apps/mobile`).

## 🖼️ Vistas del Producto

### Web Pública y Tienda
| Portada (Desktop) | Tienda / Catálogo | Checkout / Carrito |
| --- | --- | --- |
| ![Home publica](.github/assets/readme/home-public.png) | ![Tienda publica](.github/assets/readme/storefront-shop.png) | ![Checkout pickup](.github/assets/readme/pickup-checkout.png) |

### Panel de Administración
| Dashboard Overview | Gestión de Leads | Gestión de Tienda |
| --- | --- | --- |
| ![Dashboard overview](.github/assets/readme/dashboard-overview.png) | ![Dashboard leads](.github/assets/readme/dashboard-leads.png) | ![Dashboard tienda](.github/assets/readme/dashboard-store.png) |

### Área del Socio y Móvil
| Mi Cuenta | Home (Mobile) |
| --- | --- |
| ![Mi cuenta](.github/assets/readme/account.png) | ![Home mobile](.github/assets/readme/home-mobile.png) |

## 🏗️ Arquitectura

El proyecto separa responsabilidades para maximizar la flexibilidad:

- **Next.js 16 + React 19**: Interfaz principal y lógica de servidor (RSC).
- **Supabase**: Auth, base de datos de infraestructura (leads, rutinas, miembros) y settings.
- **Medusa v2**: Motor de comercio, catálogo y transacciones (operando sobre el mismo Postgres de Supabase).
- **Tailwind CSS v4**: Estilos modernos y performance optimizada.

Más detalles en [docs/architecture.md](docs/architecture.md).

## 🛠️ Desarrollo Local

### Requisitos previos
- Node.js 20+
- Docker (para servicios de backend)

### Configuración rápida

1. **Clonar e instalar**:
   ```bash
   npm install
   ```

2. **Backend (Medusa + Redis)**:
   ```bash
   npm run dev:backend
   ```

3. **Frontend y Dashboard**:
   ```bash
   npm run dev
   ```

4. **App Móvil (Opcional)**:
   ```bash
   npm run dev:mobile
   ```

## 🔐 Variables de Entorno

Completa tu archivo `.env.local` usando `.env.example` como referencia. Se requieren claves de Supabase, Medusa Admin API y SMTP para flujos de correo.

## 📂 Documentación

- [📘 Manual de Usuario](docs/manual-usuario.md) - Guía para el equipo del gimnasio.
- [🏗️ Arquitectura del Sistema](docs/architecture.md) - Detalles técnicos y flujo de datos.
- [🔗 Runbook de Reconciliación](docs/archive/store-pickup-reconciliation-runbook.md) - Cómo manejar la sync Supabase-Medusa.

---
*Construido por Digitalbit Solutions para un fitness más digital.*
