# /var/www/ihrapps/dvarim-app/frontend/Dockerfile
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Crear .env.production con la URL correcta
RUN echo "VITE_API_URL=https://dvarim.ihrapps.com/api" > .env.production

RUN npm run build

# Etapa de producción
FROM node:20-alpine

WORKDIR /app

# Instalar serve para servir archivos estáticos
RUN npm install -g serve

# Copiar el build
COPY --from=build /app/dist /app/dist

EXPOSE 4173

CMD ["serve", "-s", "dist", "-l", "4173"]