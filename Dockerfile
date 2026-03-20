FROM node:22-bookworm-slim AS base

ENV NODE_ENV=production
WORKDIR /app

FROM base AS deps

COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS builder

COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS runner

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
WORKDIR /app

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=5 CMD ["node", "-e", "const port = process.env.PORT || 3000; fetch(`http://127.0.0.1:${port}`).then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1));"]

CMD ["node", "server.js"]
