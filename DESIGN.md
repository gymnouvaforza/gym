# DESIGN.md

Contrato visual del repositorio para agentes y trabajo futuro de UI.

Este documento sigue la idea de `DESIGN.md` popularizada por Stitch: un sistema de diseno legible por agentes para producir interfaces consistentes dentro del proyecto. Aqui no define arquitectura ni dominio. Define como debe verse y sentirse producto.

## Estado y autoridad

- `DESIGN.md` es la fuente visual principal para nuevas tareas de UI.
- No reemplaza al codigo. Si hay tension entre este documento y implementacion actual, primero manda patron real ya consolidado en `src/styles/tokens.css`, `src/app/globals.css` y layouts activos.
- No obliga a redisenar pantallas existentes en esta fase.
- Si una tarea solo toca logica, API o datos, este documento puede ignorarse.
- Tambien sirve para armonizar web publica y dashboard sin forzar que ambas superficies se vean iguales.

## Superficies que cubre

- Web publica comercial en `src/app/(public)`.
- Dashboard operativo en `src/app/(admin)/dashboard`.

Ambas comparten misma marca base. No comparten mismo ritmo visual.

La web publica vende. El dashboard opera. Pero ambas deben parecer parte del mismo gimnasio, no dos productos distintos.

## North Star

Producto de gimnasio local serio. Debe sentirse:

- atletico
- directo
- sobrio
- confiable
- con energia controlada
- operativo con personalidad de marca

No debe sentirse:

- startup generica
- SaaS morado/blanco
- lujo blando
- gaming
- brutalista caotico
- dashboard corporativo azul sin personalidad

## Fuentes de verdad actuales

Basar decisiones nuevas en estos archivos antes de inventar patron nuevo:

- `src/styles/tokens.css`
- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/app/(public)/layout.tsx`
- `src/app/(admin)/dashboard/layout.tsx`

## Foundations

### Color

Paleta base actual. Mantenerla.

- primario: rojo Nova `#d71920`
- hover primario: `#bf161c`
- secundario: negro/casi negro `#111111`
- fondo principal claro: beige `#f5f5f0`
- superficie clara: blanco `#ffffff`
- panel oscuro: `#111111`
- texto principal: `#111111`
- texto muted: `#555555`
- texto invertido: `#ffffff`

Semanticos actuales:

- info: `#00588f`
- success: `#476058`
- warning: `#6d5940`
- error: `#b91c1c`

Reglas:

- rojo se usa para foco, CTA, datos clave, acento y senales de energia.
- negro estructura interfaz, tipografia fuerte, paneles y contraste.
- beige evita blanco clinico en superficie principal.
- no introducir nueva paleta principal sin cambio consciente de branding.
- no mover admin a azules por costumbre.
- no convertir marketing en monocromo plano si rompe energia atletica.

### Tipografia

Fuentes actuales:

- display: `Oswald`
- lectura/interfaz: `Inter`

Reglas:

- usar display para titulares, labels de alto impacto, CTAs y microcopys de caracter.
- usar sans para lectura, formularios, tablas, ayudas, estados y contenido largo.
- titulares pueden ir en mayusculas cuando busquen impacto.
- evitar mezclar mas familias.
- evitar scripts, serif elegantes o tipografias techno.

### Radio, bordes y forma

Regla principal: sharp corners.

- `--radius-base: 0px` manda experiencia general.
- evitar pills suaves y cards demasiado redondeadas.
- si hace falta suavidad puntual, usarla como excepcion funcional, no como tono base.
- bordes suelen ser finos, discretos y de alto orden visual, no pesados.

Compatibilidad con dashboard actual:

- se aceptan radios pequenos o medios en piezas concretas del admin cuando ya exista patron consolidado de componente.
- ejemplos validos: metric cards destacadas, alertas operativas, paneles sticky o bloques de accion secundaria.
- esos radios son excepcion de modulo, no nuevo default del sistema.
- si una vista nueva del dashboard usa `AdminSurface`, `DashboardPageHeader` o componentes admin consolidados, se respeta su forma actual antes que forzar esquinas totalmente rectas.

### Spacing y densidad

Ritmo general:

- publico: bloques amplios, respiracion clara, hero grande, secciones con aire.
- admin: densidad media-alta, informacion inmediata, menos aire vertical muerto.

Reglas:

- no comprimir marketing hasta parecer dashboard.
- no inflar dashboard con heroes enormes o vacios excesivos.
- mantener jerarquia por spacing antes que por decoracion.
- en dashboard se permite una capa corta de dramatizacion visual al inicio de pagina si mejora escaneo: header, metricas, alertas o quick actions.

### Motion

Motion permitida actual:

- fade in suave
- slide up suave
- stagger pequeno
- indicadores pequenos como scroll cue

Motion no permitida:

- rebotes juguetones
- paralaje pesado
- animaciones continuas sin funcion
- loaders vistosos que distraen de operacion

Reglas:

- motion debe reforzar lectura o estado.
- en admin, motion mas corta y sobria que en publico.
- respetar accesibilidad y reducir dependencia de motion para entender UI.

### Fondos, texturas e imagen

Patrones actuales validos:

- fondos beige o blancos con contraste negro/rojo
- paneles oscuros para cortar secciones
- grid atletico sutil con rojo muy bajo alpha

Reglas:

- usar textura solo si apoya tono atletico y no roba lectura.
- fotografia debe sentirse real, fuerte, entrenamiento, progreso y personas reales.
- evitar stock generico de oficina, wellness etereo o poses fitness artificiales.
- iconos simples, funcionales, preferiblemente lineales y sobrios.

## Composicion

### Web publica

Objetivo: vender propuesta, confianza y accion.

Patrones:

- hero dominante
- titulares con pegada
- secciones alternando claro/oscuro para ritmo
- CTA visible
- narrativa por bloques: valor, planes, horarios, equipo, tienda, contacto

Reglas:

- una idea principal por seccion.
- contraste alto entre copy principal y fondo.
- rojo como ancla, no como pintura total.
- usar display con intencion, no en cada parrafo.
- cada pagina publica debe sentirse parte de mismo gimnasio, no micrositio nuevo.

### Dashboard / admin

Objetivo: operar rapido, leer estado, tomar accion.

Patrones:

- sidebar oscura
- header claro y operativo
- cards y paneles limpios
- estados, metricas, avisos y tablas con lectura rapida
- acentos de marca visibles en headers, metricas, alerts y CTAs clave

Reglas:

- compartir marca base con publico, pero bajar teatralidad.
- priorizar escaneo, densidad y claridad de accion.
- evitar heroes de marketing dentro del panel.
- usar rojo para puntos de control y enfasis, no para pintar toda pantalla.
- mantener bloques informativos compactos y comparables.
- aceptar que el dashboard actual ya usa un tono editorial-operativo: tipografia display fuerte en headers, iconografia roja, fondos blancos con acentos y algun bloque premium u oscuro.
- nuevas pantallas admin deben encajar con ese lenguaje existente antes que rebajarlo artificialmente a un SaaS neutro.
- no mezclar en la misma vista demasiados subestilos admin.
- elegir un dominante segun objetivo:
- sobrio para tablas, formularios, detalle y mantenimiento
- expresivo para overview, metricas, headers, quick actions y alertas
- cuando convivan ambos, el expresivo abre o destaca; el sobrio sostiene lectura y trabajo.

### Lenguaje visual del dashboard actual

Patrones ya validados por implementacion real:

- `DashboardPageHeader` con display fuerte, eyebrow roja, icono en bloque claro y presencia de marca.
- `AdminSurface` como base de panel: blanco, borde fino, sombra contenida y densidad media.
- metric cards con un poco mas de caracter que el resto del admin.
- badges compactos, uppercase y de lectura rapida.
- labels de formulario pequenas, uppercase y de alto contraste contextual.
- sidebar oscura con sensacion de consola operativa, no de producto enterprise generico.

Reglas para extender ese estilo:

- reutilizar primero `components/admin/*` antes de crear otro lenguaje.
- si una pagina admin necesita impacto visual, hacerlo con tipografia, icono, acento rojo y ritmo de superficies; no con gradientes aleatorios ni color excesivo.
- fondos del admin deben seguir claros en contenido y oscuros en navegacion o bloques de enfasis, no invertir todo el panel sin necesidad.
- sombras admin: visibles pero cortas. Deben separar capas, no parecer marketing glossy.
- uppercase en admin esta permitido y ya es parte del sistema, pero reservarlo para labels, badges, encabezados cortos y CTAs compactos. No para parrafos largos.
- display en admin se acepta en headers, metricas y modulos de entrada. Para tablas, forms, ayudas y detalle fino, seguir con sans.

## Componentes y patrones

### Hero

- solo para publico
- grande, aspiracional, con titular de impacto
- puede usar fondos oscuros, grids, media y tipografia display
- no trasladar este patron al dashboard

### Sections

- usar shell consistente
- mantener alternancia de ritmo y contraste
- cada section necesita titulo, copy y accion o contenido principal claros

### Cards

- forma base sharp
- marketing: cards mas atmosfericas, pero limpias
- admin: cards mas funcionales, densas y con escaneo rapido
- no usar sombras blandas enormes como recurso principal
- en admin se permite una card mas expresiva si ya cumple funcion de resumen, alerta o quick action.
- cuando haya mezcla de cards expresivas y funcionales, las funcionales deben ser mayoria.

### Buttons

- CTA principal: rojo o negro segun contexto, alto contraste
- label corta, directa, de accion
- marketing puede usar `font-display` y uppercase
- admin prioriza claridad; uppercase solo si no empeora legibilidad
- en dashboard actual son validos botones compactos uppercase de alto peso visual para acciones operativas.
- mantener consistencia dentro de la misma pantalla: no mezclar boton blando redondeado con boton sharp industrial sin motivo.

### Forms

- siempre claros y directos
- labels y ayudas en sans
- errores visibles con patron semantico actual
- no esconder estados criticos solo en color

### Tablas y listados

- prioridad admin
- filas limpias, contraste sobrio, spacing comedido
- acciones visibles sin ruido
- badges y estados deben ser interpretables de un vistazo
- cabeceras uppercase compactas y pequenos acentos rojos son validos si ya siguen patron de modulo admin.

### Empty states

- explicar falta de datos con tono operativo
- incluir siguiente accion obvia
- no convertirlos en piezas decorativas

### Badges y estados

- usar semanticos actuales
- success/warning/error/info deben ser claros y consistentes
- no inventar colores nuevos por modulo

## Do / Don't

### Do

- reutilizar tokens y utilities existentes antes de crear nuevos
- mantener contraste fuerte y jerarquia clara
- pensar si patron pertenece a publico o admin antes de disenar
- usar display para caracter, sans para uso diario
- sostener esquinas sharp como rasgo del sistema

### Don't

- no introducir UI SaaS generica.
- no meter gradientes morados/azules por defecto.
- no redondear todo.
- no copiar bloques de marketing dentro del dashboard.
- no crear variaciones de componentes sin segundo uso claro.
- no usar animacion como maquillaje de falta de jerarquia.
- no abrir nueva direccion visual sin actualizar este documento.

## Defaults para agentes

Si tarea de UI no especifica estilo, asumir:

- paleta actual rojo/negro/beige
- esquinas sharp
- `Oswald` para impacto y `Inter` para lectura
- publico = mas aspiracional y narrativo
- admin = mas sobrio, denso y operativo
- admin puede ser expresivo dentro del lenguaje actual del dashboard
- reutilizar `components/ui` y patrones existentes antes de crear primitives nuevas
- si tarea cae en dashboard, revisar primero `components/admin/*`, `DashboardPageHeader`, `AdminSurface` y vistas hermanas del modulo

## Criterio de resolucion de conflictos

Si aparecen dudas:

1. Revisar codigo real en tokens, globals y layouts activos.
2. Decidir si cambio pertenece a publico o admin.
3. Reutilizar patron existente mas cercano.
4. Solo si falta patron, extender sistema sin romper bases de este documento.

## Definition of done visual

Una tarea de UI queda alineada cuando:

- respeta paleta, tipografia y forma base
- no mezcla lenguaje de marketing con lenguaje operativo
- reutiliza patron existente o amplia uno de forma coherente
- si toca dashboard, no rebaja ni rompe el lenguaje admin ya consolidado
- mantiene contraste, jerarquia y accion clara
- puede ser continuada por otro agente sin redecidir estilo desde cero
