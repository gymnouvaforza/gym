# Supabase Auth - Confirm signup template

Usa esta guia para configurar el correo de confirmacion de registro desde el dashboard de Supabase sin depender del email por defecto del plan free.

## URL configuration

- `Site URL`: `https://nuovaforzagym.com`
- Redirect URLs:
  - `https://nuovaforzagym.com/auth/confirm`
  - `http://localhost:3000/auth/confirm`

Si trabajas con previews, anade tambien el dominio preview que uses para pruebas.

## SMTP

Configura el SMTP propio desde **Supabase Auth > SMTP Settings**. Las variables del repo no actualizan por si solas los correos de Supabase Auth: este cambio hay que hacerlo dentro del dashboard.

Valores a cargar:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `SMTP_FROM_EMAIL`

## Suggested subject

```text
Confirma tu cuenta en Nuova Forza
```

## Suggested HTML template

```html
<h2>Confirma tu cuenta</h2>
<p>Ya casi esta listo tu acceso privado de Nuova Forza.</p>
<p>Haz clic en el boton para activar tu correo y terminar el registro.</p>
<p>
  <a
    href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/registro/completado?confirmed=1"
    style="display:inline-block;padding:12px 18px;background:#d71920;color:#ffffff;text-decoration:none;font-weight:600;"
  >
    Confirmar mi cuenta
  </a>
</p>
<p>Si el boton no funciona, copia y pega este enlace en tu navegador:</p>
<p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/registro/completado?confirmed=1">
    {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/registro/completado?confirmed=1
  </a>
</p>
<p>Si no intentaste crear esta cuenta, puedes ignorar este correo.</p>
```

## Validation checklist

- El email llega con remitente de Nuova Forza, no con el emisor generico de Supabase.
- El boton abre `/auth/confirm`, no `/?code=...`.
- Tras confirmar, el usuario acaba en `/registro/completado?confirmed=1`.
- Desde la pantalla final puede entrar en `/mi-cuenta` o en `/acceso`.
