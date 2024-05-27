# Dockerfile for React Frontend

# Stage 1: Build the application
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --save --save-exact
COPY . .

ARG REACT_APP_BACKEND_HOST
# Set environment variable using the build argument
ENV REACT_APP_BACKEND_HOST $REACT_APP_BACKEND_HOST

RUN npm run build

# Stage 2: Serve the application
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
