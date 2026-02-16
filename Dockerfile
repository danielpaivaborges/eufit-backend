# --- Estágio 1: Build ---
FROM node:18-alpine AS builder

# INSTALAÇÃO DO OPENSSL (Correção do erro)
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
# Copia a pasta prisma (do src para a raiz do container, conforme ajustamos antes)
COPY src/prisma ./prisma/

RUN npm install

COPY . .

# Gera o cliente do Prisma
RUN npx prisma generate
RUN npm run build

# --- Estágio 2: Produção ---
FROM node:18-alpine

# INSTALAÇÃO DO OPENSSL TAMBÉM NA PRODUÇÃO (Essencial)
RUN apk add --no-cache openssl

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["sh", "-c", "npx prisma db push && npm run start:prod"]