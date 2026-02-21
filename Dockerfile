FROM node:18-alpine

# PASSO VITAL: Instala as bibliotecas que o Prisma exige no Alpine
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

COPY package*.json ./
RUN npm install

# Copia a pasta prisma e gera o client
COPY src/prisma ./src/prisma
RUN npx prisma generate --schema=./src/prisma/schema.prisma

COPY . .

RUN npm run build

# Roda as migrações e inicia o app
CMD npx prisma migrate deploy --schema=./src/prisma/schema.prisma && npm run start:prod