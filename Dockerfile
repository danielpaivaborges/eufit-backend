FROM node:18-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./
# Copia a pasta prisma para a raiz do app no container
COPY src/prisma ./prisma/

RUN npm install

COPY . .

# Limpa qualquer build anterior antes de começar
RUN rm -rf dist

RUN npx prisma generate
RUN npm run build

EXPOSE 3000

# Usamos o caminho padrão do NestJS que é dist/main
CMD sh -c "npx prisma db push && node dist/main.js"