# --- Estágio 1: Build (Compilação) ---
FROM node:18-alpine AS builder

# Define pasta de trabalho
WORKDIR /app

# Copia arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instala tudo (incluindo devDependencies para conseguir compilar)
RUN npm install

# Copia o resto do código
COPY . .

# Gera o cliente do Prisma e Compila o NestJS
RUN npx prisma generate
RUN npm run build

# --- Estágio 2: Produção (Para rodar leve) ---
FROM node:18-alpine

WORKDIR /app

# Copia apenas o necessário do estágio anterior
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Expõe a porta padrão do NestJS
EXPOSE 3000

# Comando para iniciar (Roda as migrations do banco e inicia a API)
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:prod"]