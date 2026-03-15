# Build stage
FROM node:18-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Add custom nginx config to handle SPA routing and proxying if needed
# For now, we assume the host handles proxying or we use a basic config
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
