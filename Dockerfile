# --- Estágio 1: Build ---
FROM node:18-alpine AS builder

WORKDIR /app

# 1. Copia os arquivos de dependência
COPY package*.json ./

# 2. CORREÇÃO: Copia a pasta prisma de dentro do src para a raiz do container
# Origem (PC): src/prisma | Destino (Container): ./prisma
COPY src/prisma ./prisma/

# 3. Instala dependências
RUN npm install

# 4. Copia o resto do código
COPY . .

# 5. Gera o cliente do Prisma e Compila
RUN npx prisma generate
RUN npm run build

# --- Estágio 2: Produção ---
FROM node:18-alpine

WORKDIR /app

# Copia apenas o necessário do estágio anterior
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
# Garante que a pasta prisma também vá para o estágio final
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:prod"]