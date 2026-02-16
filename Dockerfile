FROM node:18-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./
COPY src/prisma ./prisma/

RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

# Comando de diagnóstico e execução
# 1. Ele tenta sincronizar o banco
# 2. Ele lista a pasta dist para o log (ajuda a gente a ver o erro se falhar)
# 3. Ele procura o main.js e executa
CMD sh -c "npx prisma db push && echo 'Conteúdo da pasta dist:' && ls -R dist && node $(find dist -name main.js | head -n 1)"