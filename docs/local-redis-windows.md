# Redis local en Windows con Docker Desktop

## Objetivo

Levantar solo `redis` en Docker y seguir ejecutando `medusa` y `next` desde PowerShell.

Este es el flujo local recomendado para este repo cuando trabajas en Windows:

- `redis` en Docker Desktop
- `medusa` con `npm run dev:medusa`
- `next` con `npm run dev`

Si prefieres ejecutar `medusa` tambien en Docker y dejar solo el frontend en tu host, usa
[docker-compose.local.yml](/C:/digitalbitsolutions/gym/docker-compose.local.yml).

## Configuracion necesaria

En [apps/medusa/.env](/C:/digitalbitsolutions/gym/apps/medusa/.env) deja:

```env
REDIS_URL=redis://localhost:6379
```

No uses `redis://redis:6379` para local si `medusa` no corre dentro de Docker.

## Comandos utiles

Desde la raiz del repo:

```bash
npm run dev:redis
```

Esto hace una de estas tres cosas:

- crea el contenedor `gym-redis` si no existe
- lo arranca si existe pero esta parado
- no hace nada si ya esta levantado

Estado del contenedor:

```bash
npm run dev:redis:status
```

Recrear el contenedor desde cero:

```bash
npm run dev:redis:reset
```

## Flujo completo local

1. Levanta Redis:

```bash
npm run dev:redis
```

2. Arranca Medusa:

```bash
npm run dev:medusa
```

3. Arranca Next.js en otra terminal:

```bash
npm run dev
```

## Flujo alternativo: grupo local `medusa + redis`

Si quieres usar un unico grupo Docker para el backend del gym y arrancar el frontend manualmente:

```bash
npm run dev:backend
npm run dev
```

Eso usa [docker-compose.local.yml](/C:/digitalbitsolutions/gym/docker-compose.local.yml) y publica:

- `localhost:9000` para Medusa
- `localhost:6379` para Redis

Logs del backend:

```bash
npm run dev:backend:logs
```

Apagar el grupo:

```bash
npm run dev:backend:down
```

## Verificacion

- Medusa: [http://localhost:9000/health](http://localhost:9000/health)
- Web: [http://localhost:3000](http://localhost:3000)
- Tienda: [http://localhost:3000/tienda](http://localhost:3000/tienda)

## Notas

- El compose de [docker-compose.dokploy.yml](/C:/digitalbitsolutions/gym/docker-compose.dokploy.yml) esta pensado para Dokploy y depende de `dokploy-network`, asi que no es la opcion recomendada para arrancar solo Redis en local.
- Si Docker Desktop no esta abierto, `npm run dev:redis` fallara con un mensaje claro.
- Para desarrollo local con el frontend fuera de Docker, `medusa` necesita `ports`, no solo `expose`. Por eso el compose local publica `9000:9000`.
