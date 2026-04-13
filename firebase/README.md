# Plan B: Firebase Alternative

Este directorio contiene la configuracion necesaria para migrar el backend de Supabase a Firebase (Firestore, Auth y Storage) en caso de que sea necesario.

## Correspondencias de Datos (Supabase SQL -> Firestore)

| Supabase Table | Firestore Collection | Notas |
|----------------|----------------------|-------|
| `trainer_profiles` | `trainer_profiles` | Document ID = Supabase UID |
| `member_profiles` | `member_profiles` | |
| `member_plan_snapshots` | `member_plan_snapshots` | Referencia por `member_id` |
| `site_settings` | `site_settings` | Documentos clave para CMS |
| `marketing_testimonials` | `marketing_testimonials` | |
| `pickup_requests` | `pickup_requests` | |

## Autenticacion

Firebase Auth sustituiria a Supabase Auth. Los UIDs de los usuarios deberian mapearse para mantener la integridad de las relaciones.

## Almacenamiento de Archivos

Firebase Storage sustituiria a los buckets de Supabase.

## Scripts de Migracion

Se recomienda crear una Cloud Function para importar los datos desde un volcado JSON de Supabase en caso de activarse este plan B.
