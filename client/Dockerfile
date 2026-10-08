FROM node:24-alpine AS build
WORKDIR /src
ENV NX_DAEMON=false NX_NO_CLOUD=true
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx nx build web --configuration=production --skip-nx-cache

FROM nginx:1.29-alpine AS runtime
ENV API_UPSTREAM=http://api:8080
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /src/dist/apps/web/browser /usr/share/nginx/html
EXPOSE 80
