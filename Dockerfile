# Stage 1: Build the React application
FROM node:20-alpine AS build

WORKDIR /app

# Copy package manifests first for caching layers
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Build production bundle (outputs to /app/dist)
RUN npm run build

# Stage 2: Serve production build using Nginx on port 5173
FROM nginx:alpine

# Copy build artifacts to Nginx document root
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration configured for port 5173
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 5173
EXPOSE 5173

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
