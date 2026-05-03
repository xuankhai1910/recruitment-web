# syntax=docker/dockerfile:1.6

# ---------- Build stage ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Vite biến VITE_* được inline lúc build -> nhận qua build args
ARG VITE_API_BASE_URL
ARG VITE_STATIC_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_STATIC_URL=$VITE_STATIC_URL

COPY package*.json ./
# --legacy-peer-deps để bỏ qua conflict openapi-typescript vs typescript@6
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

COPY . .
RUN npm run build

# ---------- Run stage ----------
FROM nginx:1.27-alpine AS runner

# Copy SPA static + nginx config (SPA fallback)
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
