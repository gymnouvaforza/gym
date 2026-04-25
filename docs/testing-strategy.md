# Estrategia de Testing - Gym Web Backoffice

Este documento define el enfoque de calidad y validación para el proyecto Gym Web Backoffice (Next.js 16, React 19, Supabase, Firebase, Medusa).

## 1. Estado Actual

El proyecto cuenta con una infraestructura de testing híbrida:

- **Vitest**: Utilizado para unit tests y tests de integración (lógica de negocio, helpers, route handlers).
- **Playwright**: Utilizado para flujos críticos de extremo a extremo (E2E) en el dashboard y web pública.

### Cobertura Existente (Principales Áreas)
- **Auth**: Cubierto por tests unitarios en APIs y E2E de login.
- **Membresías**: Validación de QR y estado de membresía con tests de integración.
- **Pagos**: Lógica de PayPal mockeada en tests de integración.
- **Store**: Integración con Medusa (SDK y Repositorios) con tests unitarios.
- **Email**: Validación de configuración SMTP y envío de correos.

### Áreas por Reforzar
- **Diagnóstico técnico**: Falta validación automatizada de la salud de servicios externos.
- **Smoke tests de API**: Mayor cobertura en endpoints críticos del dashboard.
- **Manejo de errores**: Validación de estados de error cuando fallan servicios externos (Supabase/Medusa down).

## 2. Matriz de Cobertura por Dominio

| Dominio | Tipo de Test | Prioridad | Estado |
| :--- | :--- | :--- | :--- |
| Auth / Sesión / Roles | Unit + Integration | Crítica | Alta |
| Dashboard (Admin) | E2E + Unit | Alta | Media |
| Leads / Contacto | Unit | Media | Media |
| Miembros (Gestión) | Integration | Alta | Media |
| Membresías (QR/Validación) | Integration | Crítica | Alta |
| Pagos Parciales | Unit | Alta | Baja |
| Emails / SMTP | Integration | Media | Alta |
| Marketing / CMS | Unit | Media | Media |
| Horarios / Planes | Unit | Media | Media |
| Tienda / Medusa Bridge | Integration | Crítica | Media |
| Supabase Queries | Integration | Alta | Alta |
| API Routes Internas | Integration | Alta | Media |
| Smoke Tests Producción | Integration | Crítica | Baja |

## 3. Tipos de Test Recomendados

### Unit Tests
- Lógica pura (formatters, cálculos financieros, validadores Zod).
- Ubicación: Sibling al archivo (`.test.ts`).

### Integration Tests
- Server Actions y Route Handlers con mocks de servicios externos.
- Validación de interacción entre componentes de la capa de datos.

### API Smoke Tests
- Comprobación rápida de salud de endpoints críticos.
- Deben validar: `missing env`, `unauthorized`, `success mock`.

### E2E (Playwright)
- Happy path de flujos críticos (Compra, Registro de entrada QR, Dashboard login).
- Ubicación: `tests/e2e/`.

## 4. Comandos de Ejecución

| Escenario | Comando |
| :--- | :--- |
| Cambios pequeños (Unitarios) | `npm run test` |
| Cambios en Dashboard | `npm run test:admin` |
| Cambios en Auth | `npm run test:scope src/app/api/auth` |
| Cambios en Tienda (Medusa) | `npm run test:medusa` |
| Validación CI / Pre-deploy | `npm run test:ci` |
| Tests E2E | `npm run test:e2e` |

## 5. Scripts de Alias (package.json)

- `test:unit`: Alias de `vitest run` enfocado a lógica.
- `test:integration`: Alias para tests que requieren mocks complejos.
- `test:api`: Foco en `src/app/api`.
- `test:dashboard`: Foco en `src/app/(admin)/dashboard`.
- `test:smoke`: Tests de salud de servicios.
- `test:ci`: Ejecución completa para pipelines.

---
*Nota: Este documento es una guía viva y debe actualizarse al añadir nuevas capacidades de validación.*
