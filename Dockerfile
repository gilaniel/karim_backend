# --- Базовый слой ---
FROM node:22-alpine AS base
WORKDIR /usr/src/app
COPY package*.json ./

# --- Слой для локальной разработки (используется в docker-compose) ---
FROM base AS development
RUN npm install --only=development
COPY . .
# Команда переопределяется в docker-compose, но оставим по умолчанию
CMD ["npm", "run", "start:dev"]

# --- Слой сборки (компилирует TypeScript в JavaScript) ---
FROM base AS builder
RUN npm install --only=development
COPY . .
RUN npm run build

# --- Финальный слой для продакшена (максимально легкий) ---
FROM base AS production
# Устанавливаем ТОЛЬКО продакшен-зависимости (--omit=dev)
RUN npm install --only=development

# Копируем только скомпилированный код из слоя builder
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/src/main"]