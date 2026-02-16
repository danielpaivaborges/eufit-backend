FROM node:18-alpine

# Instala dependências nativas
RUN apk add --no-cache openssl

WORKDIR /app

# Copia arquivos de configuração
COPY package*.json ./
COPY tsconfig*.json ./

# Copia a pasta prisma (do seu src/prisma para a raiz do container)
COPY src/prisma ./prisma/

# Instala as dependências
RUN npm install

# Copia todo o código fonte
COPY . .

# Gera o Prisma Client e Compila o código NestJS
RUN npx prisma generate
RUN npm run build

# Expõe a porta
EXPOSE 3000

# Comando de inicialização: Sincroniza o banco e roda o arquivo que o NestJS gera no build
# O arquivo principal costuma ficar em dist/main.js ou dist/src/main.js
CMD ["sh", "-c", "npx prisma db push && node dist/main.js"]