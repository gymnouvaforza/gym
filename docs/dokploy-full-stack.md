# Historico: deploy completo en Dokploy

## Objetivo

Este documento describe una topologia anterior que ya no es la recomendada para produccion.

La arquitectura vigente es:

- `https://nuovaforzagym.com` -> frontend `Next.js` en Vercel
- `https://gym.yampi.eu` -> backend `Medusa` en Dokploy
- `redis` -> servicio interno del stack `Medusa`

Usa [medusa-dokploy-vps.md](/C:/digitalbitsolutions/gym/docs/medusa-dokploy-vps.md) como guia operativa actual.

## Archivos que siguen vigentes

- [apps/medusa/Dockerfile](/C:/digitalbitsolutions/gym/apps/medusa/Dockerfile)
- [apps/medusa/.dockerignore](/C:/digitalbitsolutions/gym/apps/medusa/.dockerignore)
- [docker-compose.dokploy.yml](/C:/digitalbitsolutions/gym/docker-compose.dokploy.yml)

## Estado

- El frontend ya no se sirve desde Dokploy en produccion.
- El `Dockerfile` raiz y el servicio `web` de Dokploy quedaron retirados.
- Conservamos este documento solo como referencia historica de la etapa full stack en VPS.

## Sustitucion recomendada

- Frontend: Vercel con dominio `nuovaforzagym.com`
- Backend: `medusa + redis` en Dokploy con dominio `gym.yampi.eu`
- Base de datos: Supabase con `DATABASE_URL` directa para Medusa

## Verificacion de la arquitectura nueva

1. `https://gym.yampi.eu/health`
2. `https://nuovaforzagym.com`
3. `https://nuovaforzagym.com/tienda`
4. CRUD de tienda desde el dashboard propio
