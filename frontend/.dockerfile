# Dockerfile for React Frontend

# Stage 1: Base image and dependencies
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install --save --save-exact
COPY . .

# Stage 2: Build the application (Production)
FROM base AS builder
ARG REACT_APP_BACKEND_HOST
# Set environment variable using the build argument
ENV REACT_APP_BACKEND_HOST $REACT_APP_BACKEND_HOST
RUN npm run build

# Stage 3: Serve the application with nginx (Production)
FROM nginx:alpine AS production
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
