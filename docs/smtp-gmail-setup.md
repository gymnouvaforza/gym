# SMTP Gmail para pickup

Guia minima para probar el envio `pickup` con Gmail en un entorno de bajo volumen.

## Variables necesarias

Define estas variables en el servidor Next.js:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-cuenta@gmail.com
SMTP_PASSWORD=tu-app-password
SMTP_FROM_EMAIL="Nova Forza <tu-cuenta@gmail.com>"
```

Alternativa SSL directa:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=tu-cuenta@gmail.com
SMTP_PASSWORD=tu-app-password
SMTP_FROM_EMAIL="Nova Forza <tu-cuenta@gmail.com>"
```

## Como encaja con el dashboard

- `notification_email` y `transactional_from_email` se editan en `/dashboard/info` y se guardan en Supabase.
- La credencial SMTP no sale del entorno del servidor y no se guarda en Supabase.
- Si `transactional_from_email` no coincide con el remitente o alias SMTP autorizado, el sistema envia desde `SMTP_FROM_EMAIL` y usa el correo del dashboard como `reply-to`.

## Gmail y app password

- Usa una cuenta con verificacion en dos pasos activada.
- Genera una app password especifica para correo saliente.
- No reutilices la contrasena principal de la cuenta Google.

## Nota operativa

Esta configuracion esta pensada para MVP y bajo volumen. La implementacion es SMTP generica, asi que mas adelante puedes cambiar a otro proveedor sin tocar Supabase ni el dashboard.
