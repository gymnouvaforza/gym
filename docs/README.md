# Documentacion de Nova Forza

Bienvenido al centro de documentacion de Nova Forza Gym. Aqui encontraras informacion para operar, administrar y entender la infraestructura tecnica del gimnasio.

---

## Empezando

### [Design Contract](../DESIGN.md)
Guia visual principal para agentes y tareas de frontend. Define paleta, tipografia, densidad y reglas separadas para web publica y dashboard.

### [Manual de Usuario](manual-usuario.md)
Guia practica para el personal del gimnasio. Aprende a gestionar miembros, rutinas, resenas y pedidos de la tienda.

> [!TIP]
> Ideal para capacitacion de nuevo staff.

### [Galeria del Producto](product-snapshot.md)
Un recorrido visual por todas las interfaces activas del sistema, desde la web publica hasta el panel administrativo.

---

## Informacion Tecnica

### [Arquitectura del Sistema](architecture.md)
Detalles sobre el stack tecnologico (Next.js 16, Supabase, Medusa v2), el modelo de datos y la estrategia de integracion.

### [Seguridad y Roles](auth-vs-miembros-boundary.md)
Explica como se separa la autenticacion de usuarios de la gestion de membresias operativas.

---

## Modulos Especificos

- **Tienda y e-commerce**: [Pickup Reconciliation Runbook](archive/store-pickup-reconciliation-runbook.md).
- **Operaciones de socios**: [QR & Membership Operations](membership-qr-ops.md).
- **Infraestructura**: [Medusa en Dokploy](medusa-dokploy-vps.md), [Dokploy Full Stack (historico)](dokploy-full-stack.md), [Local Redis Windows](local-redis-windows.md).

---

## Archivo Historico

Documentos de discovery, roadmaps de fases anteriores y notas de migracion viven en la carpeta [archive](archive/).

---

Mantenido por equipo de desarrollo de Digitalbit Solutions.
