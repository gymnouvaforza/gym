# Firebase Scaffold

Esta carpeta existe como base minima para el proyecto.

Estado actual:

- **Firebase Auth**: si, usado en runtime desde `src/lib/firebase/*`
- **Firestore**: no usado en runtime
- **Firebase Storage**: no usado en runtime
- **Cloud Functions**: no usadas en runtime

Objetivo:

- mantener una base pequena para Firebase CLI
- documentar que hoy Firebase se usa solo para identidad
- dejar reglas cerradas por defecto para que nada se abra por accidente

Reglas operativas:

1. No reactivar Firestore, Storage o Functions aqui sin decision explicita.
2. Si en el futuro se usan emuladores, partir desde `firebase.json`.
3. Si se abre Firestore o Storage, revisar tambien `README.md`, `docs/architecture.md` y `AGENTS.md`.

## Detalles de Sesion

El proyecto utiliza un modelo de **Session Mirror**:
- El cliente (browser) obtiene un ID Token de Firebase.
- Este token se envia a `/api/auth/session` para generar una cookie HTTP-only (`gym_firebase_session`).
- El servidor (Next.js) valida esta cookie via Firebase Admin SDK.
- **Supabase Integration**: El JWT de Firebase es compatible con las policies de Supabase (RLS) si se configura el `auth.hook` o se mapea correctamente el provider.

Referencias utiles:

- runtime auth browser: `src/lib/firebase/client.ts`
- runtime auth admin: `src/lib/firebase/server.ts`
- emails auth: `src/lib/firebase/email-actions.ts`
- session mirror: `src/app/api/auth/session/route.ts`
- middleware/proxy: `src/proxy.ts`

