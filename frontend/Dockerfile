# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Копирование зависимостей
COPY package.json ./
RUN npm install

# Копирование кода
COPY . .

# Аргументы сборки
ARG VITE_API_URL=http://localhost:8000/api/v1
ENV VITE_API_URL=$VITE_API_URL

# Сборка
RUN npm run build

# Production stage
FROM nginx:alpine

# Копирование собранного приложения
COPY --from=build /app/dist /usr/share/nginx/html

# Копирование конфигурации nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
