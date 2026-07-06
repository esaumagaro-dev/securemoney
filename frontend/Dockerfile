FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["/bin/sh", "-c", "BACKEND_API_URL=\"${BACKEND_API_URL:-http://localhost:8000}\" && sed -i \"s|__BACKEND_API_URL__|$BACKEND_API_URL|g\" /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"]
