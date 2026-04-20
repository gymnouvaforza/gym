# Firebase Functions

No usamos Cloud Functions en runtime en esta fase.

Motivo:

- el proyecto corre auth desde Firebase Auth
- datos, storage y edge viven en Supabase
- la app Next.js cubre los endpoints server-side necesarios

Si en el futuro se vuelve a usar esta carpeta:

1. confirmar que el plan no depende de Blaze para algo que queremos mantener en Spark
2. anadir solo funciones concretas, no infraestructura generica
3. documentar el cambio en `docs/architecture.md`
