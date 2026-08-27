# ---- build: compile the static bundle ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
# See backend/Dockerfile note: swap to `npm ci` once a package-lock.json
# is committed, for faster/reproducible CI builds.
RUN npm install
COPY . .
RUN npm run build

# ---- runtime: serve the static bundle with nginx ----
FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
