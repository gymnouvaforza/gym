# Auditoria Legacy - Fase 0

Inventario corto de restos legacy o ambiguos detectados durante el rebaseline del producto real.

## Objetivo

Reducir el riesgo de que alguien lea el repo como si siguiera siendo un MVP de solo home, leads y dashboard basico.

## Hallazgos y estado

### 1. Alcance antiguo en `AGENTS.md`

Estado anterior:

- el documento seguia describiendo un alcance corto basado en `home + contacto + login + dashboard basico`
- dejaba fuera tienda, carrito, checkout pickup y mi-cuenta

Accion:

- actualizado para reflejar el core real activo del producto

Estado:

- resuelto

### 2. Documentacion principal desalineada con la superficie real

Estado anterior:

- el README no explicaba bien la base actual del producto
- faltaba una vista visual rapida de las superficies ya implementadas

Accion:

- README actualizado
- snapshot visual creado en `docs/product-snapshot.md`

Estado:

- resuelto

### 3. Capturas legacy o duplicadas en `docs/`

Hallazgo:

- existian capturas sueltas y carpetas de imagenes no referenciadas que mezclaban varias iteraciones de documentacion
- esto hacia menos claro cual era el set vigente para onboarding

Accion:

- se deja como referencia principal la carpeta `docs/images/product-snapshot/`
- las capturas sueltas fuera de ese set quedan marcadas como candidatas a limpieza porque no forman parte del onboarding vigente

Estado:

- documentado para retirada controlada en una pasada de limpieza posterior

### 4. Smoke documentado solo para una parte del core

Hallazgo:

- existia una guia de smoke de PayPal sandbox, pero no una checklist corta para el core completo

Accion:

- se crea `docs/core-smoke-checklist.md`

Estado:

- resuelto

## Restos que se conservan de forma consciente

- `docs/commerce-medusa-migration.md`: sigue siendo valido porque documenta la frontera actual Next + Medusa + Supabase
- `docs/paypal-sandbox-smoke.md`: se conserva como smoke especializado del flujo PayPal pickup
- rutas admin como `/dashboard/cms` y `/dashboard/advanced`: presentes, pero todavia no deben interpretarse como CMS completo ni como modulo avanzado cerrado
- capturas sueltas en `docs/assets/` y `docs/images/`: no forman parte del snapshot vigente; mientras no se retiren, deben tratarse como material legacy no canonico

## Criterio para futuras limpiezas

Si un artefacto cumple dos condiciones, se debe retirar o documentar explicitamente:

1. ya no esta referenciado por README, docs activas ni flujo de trabajo actual
2. puede inducir a pensar que el producto sigue en un alcance viejo o diferente al real
