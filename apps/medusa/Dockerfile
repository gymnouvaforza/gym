FROM node:22-bookworm-slim AS base

WORKDIR /app
ENV MEDUSA_TELEMETRY_DISABLED=1

FROM base AS deps

COPY package.json package-lock.json .npmrc ./
RUN npm ci --legacy-peer-deps

FROM deps AS builder

COPY . .
RUN npm run build
RUN npm prune --omit=dev --legacy-peer-deps
RUN npm install --no-save --legacy-peer-deps ts-node@10.9.2 typescript@5.6.2

FROM node:22-bookworm-slim AS runner

ENV NODE_ENV=production
ENV PORT=9000
ENV MEDUSA_TELEMETRY_DISABLED=1

WORKDIR /app

# Copy production dependencies and built assets
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.medusa ./.medusa
COPY --from=builder /app/medusa-config.js /app/medusa-config.ts /app/medusa-config.runtime.js ./
COPY --from=builder /app/instrumentation.js /app/instrumentation.ts ./

# Medusa v2 expects a src directory for some resolutions, 
# we use the compiled code from .medusa/server/src
RUN mkdir -p /app/src /app/public/admin \
  && if [ -d /app/.medusa/server/src ]; then cp -R /app/.medusa/server/src/. /app/src/; fi \
  && if [ -d /app/.medusa/server/public/admin ]; then cp -R /app/.medusa/server/public/admin/. /app/public/admin/; fi \
  && chown -R node:node /app

USER node

EXPOSE 9000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=5 CMD ["node", "-e", "const port = process.env.PORT || 9000; fetch(`http://127.0.0.1:${port}/health`).then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1));"]

CMD ["npm", "run", "start"]
