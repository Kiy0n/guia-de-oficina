# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Base: Node.js 22 Alpine
# ---------------------------------------------------------------------------
FROM node:22-alpine AS base
WORKDIR /app
ENV NPM_CONFIG_UPDATE_NOTIFIER=false \
    NPM_CONFIG_FUND=false \
    NPM_CONFIG_AUDIT=false

# ---------------------------------------------------------------------------
# deps: instala TODAS as dependências (dev incluídas)
# Usa `npm ci` quando houver package-lock.json; caso contrário `npm install`.
# ---------------------------------------------------------------------------
FROM base AS deps
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# ---------------------------------------------------------------------------
# dev: Vite (5173) + Express via tsx watch (3001), código montado por volume
# ---------------------------------------------------------------------------
FROM deps AS dev
ENV NODE_ENV=development
COPY . .
EXPOSE 5173 3001
CMD ["npm", "run", "dev"]

# ---------------------------------------------------------------------------
# build: typecheck + bundle do front (dist/) + compilação do server (dist-server/)
# ---------------------------------------------------------------------------
FROM deps AS build
COPY . .
RUN npm run build

# ---------------------------------------------------------------------------
# prod: imagem enxuta, só dependências de runtime + artefatos compilados
# ---------------------------------------------------------------------------
FROM base AS prod
ENV NODE_ENV=production \
    PORT=3001
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi \
    && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY --from=build /app/dist-server ./dist-server
RUN mkdir -p /app/data && chown -R node:node /app
USER node
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT}/api/health || exit 1
CMD ["node", "dist-server/index.js"]
