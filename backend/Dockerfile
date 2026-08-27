# ---- deps: install once, reused by the runtime stage ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
# NOTE: no package-lock.json is committed yet (this repo was generated
# offline). Run `npm install` locally once to create one, commit it, then
# switch this to `npm ci --omit=dev` for faster, reproducible CI builds.
RUN npm install --omit=dev

# ---- runtime: small final image, no build tooling, non-root user ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY src ./src
EXPOSE 4000
USER node
CMD ["node", "src/server.js"]
