FROM node:18-alpine

WORKDIR /app

# Copia apenas o necessário para instalar dependências e garantir cache
COPY package*.json ./
RUN npm install

# COPIA A PASTA PRISMA (Migrações e Schema são vitais aqui!)
COPY src/prisma ./src/prisma

# Copia o resto do código
COPY . .

# Gera o Prisma Client com a versão exata do package.json
RUN npx prisma generate --schema=./src/prisma/schema.prisma

# Build do NestJS
RUN npm run build

# O segredo: Script de inicialização
CMD npx prisma migrate deploy --schema=./src/prisma/schema.prisma && npm run start:prod