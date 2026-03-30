# Decision sobre `Planes` como contenido o entidad de negocio

Decision document para cerrar el alcance de `Planes` dentro del core actual del gimnasio y evitar que futuros modulos dependan de una abstraccion que todavia no aporta valor real.

## Objetivo

Tomar una decision explicita sobre si `Planes` debe:

- seguir como contenido comercial editable
- pasar ya a una entidad de negocio reutilizable

Tambien dejar claros los impactos en:

- web publica
- dashboard
- futuros modulos del dominio gym

## Estado actual

Hoy `Planes` ya funciona como contenido comercial editable del sitio.

Fuente de verdad actual:

- tabla `public.marketing_plans` en Supabase
- gestion desde `/dashboard/marketing`
- consumo publico en `/` y `/planes`

Lo que representa hoy cada plan:

- titulo comercial
- precio visible
- etiqueta de facturacion
- descripcion
- lista de features
- destacado visual
- CTA comercial

No representa hoy:

- contrato operativo de un socio
- condicion de membresia
- elegibilidad de reservas
- regla de facturacion
- permiso de acceso a funcionalidades privadas

## Pregunta de producto

La duda razonable es si `Planes` deberia promocionarse ya a entidad formal del dominio para ser reutilizada por:

- `Miembros`
- `Reservas`
- `Rutinas`
- posibles reportes o automatizaciones futuras

## Decision central

`Planes` debe seguir siendo contenido comercial editable en esta fase.

No debe convertirse todavia en una entidad de negocio reutilizable.

## Por que esta decision es la correcta hoy

### El problema actual ya esta resuelto

El core actual necesita mostrar y operar oferta comercial publica.

Eso ya se cubre con:

- contenido editable desde dashboard
- render publico consistente en home y `/planes`
- copy, precios y beneficios pensados para conversion comercial

Promover `Planes` a entidad del dominio no resuelve un dolor activo del core actual.

### El negocio aun no exige comportamiento transaccional real

Hoy no existe en el producto una necesidad cerrada de que un plan determine de forma operativa:

- cuotas o cobros
- vigencias
- reglas de acceso
- cupos
- beneficios computables
- estados administrativos del socio

Sin esas reglas, modelar `plan_id` como entidad fuerte solo anadiria complejidad anticipada.

### Los modulos futuros ya tienen salida sin depender de esa entidad

El discovery de `Miembros` ya deja una via simple:

- usar `plan_label` o `plan_code` interno mientras no exista entidad formal

El discovery de `Rutinas` tambien evita una dependencia fuerte:

- una rutina puede alinearse con un plan comercial, pero no necesita que `Planes` sea una entidad del dominio

`Reservas` no necesita depender de planes para existir en su primera fase.

### La naturaleza del contenido actual es marketing, no operacion

Los planes actuales estan optimizados para comunicar y vender:

- badges
- copy
- precios visibles
- lista de beneficios
- destacado visual

Eso no coincide todavia con un modelo estable de negocio.
Un mismo nombre comercial podria cambiar sin que eso implique una mutacion estructural del dominio operativo.

## Impacto por superficie

### Web publica

`Planes` sigue como contenido comercial editable.

Implicaciones:

- `/` y `/planes` continúan leyendo `marketing_plans`
- la libertad de copy y presentacion visual se mantiene
- no se obliga a la web comercial a adoptar IDs o semantica operativa prematura

### Dashboard

`Planes` sigue operado desde el CMS comercial actual.

Implicaciones:

- la gestion permanece en `/dashboard/marketing`
- no hace falta crear CRUD nuevo de planes de negocio
- el equipo puede seguir iterando oferta, precio y copy sin acoplarla a reglas internas

### Miembros

`Miembros` no debe bloquearse esperando una entidad formal de planes.

Implicaciones:

- puede usar `plan_label` o `plan_code` simple en una primera fase
- la ficha operativa del socio sigue separada del CMS comercial
- una migracion futura a `plan_id` sigue siendo posible si el negocio lo exige

### Reservas

`Reservas` no debe depender de `Planes` en v1.

Implicaciones:

- una reserva puede existir por tipo de cita, no por plan
- si mas adelante hay beneficios segun plan, esa regla puede introducirse despues

### Rutinas

`Rutinas` puede mostrar o registrar una referencia comercial, pero no depender de una entidad formal de plan.

Implicaciones:

- la asignacion de rutinas sigue centrada en `Miembros`
- no se crea una dependencia circular entre rutinas y marketing

## Que si justificaria cambiar esta decision

`Planes` deberia reconsiderarse como entidad de negocio solo cuando aparezcan al menos dos necesidades operativas reales y activas entre estas:

- asignar un plan formal a un miembro con vigencia clara
- relacionar cobro o renovacion con un plan concreto
- aplicar reglas de acceso o beneficios por plan
- usar el plan en reservas, rutinas o reporting operativo de forma consistente
- mantener catalogo estable de planes con codigo interno y trazabilidad

En ese punto, la evolucion recomendada seria:

1. mantener `marketing_plans` como capa comercial publica
2. crear una entidad nueva de dominio, por ejemplo `business_plans`
3. mapear entre plan comercial visible y plan operativo interno solo cuando exista un uso real

## Lo que no debemos hacer ahora

- reutilizar `marketing_plans` como si fuera la entidad operativa del negocio
- introducir `plan_id` en modulos futuros sin reglas claras de negocio
- bloquear `Miembros`, `Reservas` o `Rutinas` esperando cerrar un modelo de planes que hoy no hace falta
- mezclar copy comercial con semantica contractual u operativa

## Decision de alcance

`Planes` sigue siendo contenido comercial editable en el core actual del proyecto.

No pasa todavia a entidad de negocio reutilizable.

La decision futura solo debe reabrirse cuando el gimnasio necesite comportamiento operativo real y recurrente alrededor de los planes, no solo presentacion comercial.
