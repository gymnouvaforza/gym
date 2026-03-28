# Discovery CMS comercial fase 1.5

## Objetivo
Priorizar la siguiente ola de contenido comercial editable despues de cerrar `Planes` y `Horarios`, sin abrir un CMS grande antes de tiempo.

## Recomendacion de prioridad
1. `Testimonios`
2. `Zonas`
3. `Equipo`

## Razonamiento corto
- `Testimonios` aporta prueba social directa en la home y es el bloque con mejor retorno comercial para una web local.
- `Zonas` ayuda a vender la propuesta del espacio y acompana bien a tienda, horarios y onboarding visual.
- `Equipo` conviene despues porque suele cambiar menos y requiere fotos, bios y roles mas cuidados.

## Modelo minimo sugerido

### Testimonios
- Tabla propia `marketing_testimonials`
- Campos minimos:
  - `id`
  - `site_settings_id`
  - `quote`
  - `author_name`
  - `author_detail`
  - `author_initials`
  - `order`
  - `is_active`
  - timestamps

### Zonas
- Tabla propia `marketing_zones`
- Campos minimos:
  - `id`
  - `site_settings_id`
  - `title`
  - `description`
  - `image_url`
  - `order`
  - `is_active`
  - timestamps

### Equipo
- Tabla propia `marketing_team_members`
- Campos minimos:
  - `id`
  - `site_settings_id`
  - `name`
  - `role`
  - `bio`
  - `image_url`
  - `order`
  - `is_active`
  - timestamps

## Superficie admin recomendada
- Mantener una sola area `Marketing` en el dashboard.
- Evolucion sugerida:
  - fase actual: `Planes` + `Horarios`
  - siguiente paso: anadir bloques plegables para `Testimonios`, `Zonas` y `Equipo`
- No abrir todavia un modulo CMS separado por entidad mientras el volumen siga siendo pequeno.

## Fronteras
- Esto sigue siendo contenido comercial editable, no dominio de negocio.
- No mezclar con `reservas`, `miembros`, `rutinas` ni con catalogo operativo de Medusa.
- Si algun bloque pasa a necesitar logica transaccional o ownership interno complejo, debe salir de la superficie `Marketing` y entrar en su propio modulo.
