# Stage 1: Build the Angular application
FROM node:22.14.0 AS build
WORKDIR /app

# Copy package.json and package-lock.json first for better caching
COPY package*.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy the build output from the build stage
COPY --from=build /app/dist/knowify-reservations-19/* .

# Create a custom nginx.conf file directly in the container
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
