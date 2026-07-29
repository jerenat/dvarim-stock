cat > /var/www/dvarim-stock/frontend/Dockerfile << 'EOF'
FROM node:22-alpine AS build

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Usar npm install en lugar de npm ci (más permisivo)
RUN npm install --legacy-peer-deps

COPY . .

# Crear .env.production
RUN echo "VITE_API_URL=https://dvarim.ihrapps.com/api" > .env.production

RUN npm run build

# Etapa de producción
FROM node:22-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist /app/dist

EXPOSE 4173
CMD ["serve", "-s", "dist", "-l", "4173"]
EOF