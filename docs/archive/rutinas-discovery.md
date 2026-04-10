# Discovery del modulo Rutinas

Discovery decision-complete para definir el futuro modulo `Rutinas` sin abrir una abstraccion enorme antes de validar ownership, editor, lectura y frontera con `Miembros`.

## Objetivo

Definir una propuesta implementable para `Rutinas` que cierre estas preguntas:

- quien es dueno del contenido
- donde se edita
- donde se consume
- como se relaciona con `Miembros`
- que queda fuera de la primera fase

## Decision central

`Rutinas` debe nacer como contenido operativo asignable a miembros, con edicion desde admin y lectura principal desde una superficie privada futura.

No debe empezar como:

- una libreria abierta de contenido marketing
- un editor complejo tipo Notion
- una app social o de coaching en tiempo real

## Problema que si resuelve

Cuando el gimnasio quiera ir mas alla de `mi-cuenta` y la venta inicial, necesitara una forma clara de:

- definir bloques de entrenamiento
- asignarlos a un socio
- mantener una version actual y una lectura simple

Hoy no existe ninguna superficie para eso, asi que el discovery debe fijar una primera version pequena y operable.

## Frontera del modulo

`Rutinas` cae en `admin + superficie privada`, con Supabase como fuente de verdad.

- `admin`: creacion, edicion y asignacion
- `mi-cuenta` o area privada futura: lectura
- `Supabase`: fuente de verdad de rutinas, bloques y asignaciones
- `Medusa`: no participa

## Relacion con Miembros

### Regla principal

`Rutinas` depende de `Miembros`, no al reves.

Eso significa:

- una rutina puede existir como plantilla sin miembro asignado
- una asignacion concreta de rutina apunta a un `member_id`
- el modulo de Miembros no necesita Rutinas para existir

## Relacion con auth y mi-cuenta

- `auth actual` solo da acceso
- `mi-cuenta` no debe convertirse todavia en el editor de rutinas
- la lectura privada de rutinas debe apoyarse en una asignacion valida a un miembro operativo

## Relacion con otros modulos

### Miembros

- relacion principal: `routine_assignments.member_id`
- el socio ve sus rutinas porque es miembro, no solo porque tiene login

### Reservas

- sin dependencia directa en v1
- no usar reservas para modelar sesiones ejecutadas de rutina

### Leads

- sin dependencia
- un lead no debe tener rutinas

### Planes

- una rutina puede estar alineada con un plan comercial, pero no debe depender de que `Planes` sea entidad formal

## Ownership del contenido

Owner principal recomendado:

- staff interno del gimnasio

Owner secundario futuro:

- coach o responsable de entrenamiento, si el negocio crece hacia ese nivel de operacion

Decision para v1:

- toda rutina se crea y mantiene desde admin por el club
- no hay edicion por parte del socio
- no hay colaboracion multirol compleja

## Modelo recomendado

### `routine_templates`

Plantilla reusable de una rutina.

Campos minimos:

- `id`
- `slug`
- `title`
- `goal`
- `difficulty`
- `summary`
- `notes`
- `is_active`
- `created_by`
- `created_at`
- `updated_at`

### `routine_blocks`

Bloques ordenados dentro de una plantilla.

Campos minimos:

- `id`
- `routine_template_id`
- `title`
- `description`
- `order`
- `created_at`
- `updated_at`

### `routine_exercises`

Ejercicios o items dentro de un bloque.

Campos minimos:

- `id`
- `routine_block_id`
- `name`
- `sets`
- `reps`
- `rest_seconds`
- `tempo`
- `notes`
- `order`
- `created_at`
- `updated_at`

### `routine_assignments`

Asignacion de una plantilla a un miembro.

Campos minimos:

- `id`
- `routine_template_id`
- `member_id`
- `status`
- `starts_at`
- `ends_at` nullable
- `assigned_by`
- `member_notes` nullable
- `internal_notes` nullable
- `created_at`
- `updated_at`

## Estados minimos de asignacion

Estados recomendados:

- `draft`
- `active`
- `archived`

Reglas:

- `draft`: asignacion preparada pero no visible para el socio
- `active`: visible y vigente
- `archived`: historica o sustituida

## Editor minimo

El editor inicial no debe ser un lienzo complejo.

Decision recomendada:

- formulario admin por plantilla
- bloques repetibles
- ejercicios repetibles por bloque
- orden manual simple

Esto se puede resolver con formularios estructurados en Next.js, `react-hook-form` y componentes del dashboard actual.

## Lectura minima

### Admin

Ruta sugerida:

- `/dashboard/rutinas`

Contenido minimo:

- listado de plantillas
- detalle de plantilla
- vista de asignaciones

### Area privada futura

Ruta sugerida:

- `/mi-cuenta/rutinas`

Contenido minimo:

- rutina activa asignada
- bloques y ejercicios en modo lectura
- notas visibles del club

No incluir en v1:

- check-ins diarios
- registro de cargas
- seguimiento avanzado de progreso

## Nivel de detalle recomendado para v1

Si un ejercicio necesita mas estructura, usar primero campos simples:

- nombre
- series
- repeticiones
- descanso
- nota

No modelar todavia:

- biblioteca universal de ejercicios
- media avanzada por ejercicio
- analytics de cumplimiento
- periodizacion compleja

## Riesgos a evitar

- convertir Rutinas en CMS generalista
- depender de Miembros para editar plantillas base
- abrir tracking de progreso demasiado pronto
- mezclar notas de coach, chat y seguimiento en la misma primera version
- usar rich text complejo cuando una estructura jerarquica ya cubre la necesidad

## Propuesta de implementacion por fases

### Fase A

- `routine_templates`
- `routine_blocks`
- `routine_exercises`
- listado y editor admin

### Fase B

- `routine_assignments`
- lectura privada para el socio
- archivo de rutinas antiguas

### Fase C

- ownership por coach
- biblioteca de ejercicios
- seguimiento de ejecucion si el negocio lo justifica

## Decision de alcance

`Rutinas` debe arrancar como modulo de contenido operativo asignable, con admin como editor y area privada como lector.

No debe empezar como modulo social, app de tracking ni editor sobredimensionado.
