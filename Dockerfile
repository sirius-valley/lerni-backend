FROM node:18-slim AS deps

RUN apt-get update -y && apt-get install -y openssl libc6

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY prisma ./prisma/
RUN npm run db:generate

FROM deps as build

WORKDIR /app

COPY package.json ./
COPY tsconfig.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY config ./config
COPY src ./src

RUN npm run build

FROM node:18-slim as prod

RUN apt-get update -y && apt-get install -y openssl libc6


WORKDIR /app

COPY package*.json ./
COPY .env ./
COPY prisma ./prisma
COPY config ./config
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist



CMD ["sh", "-c", "npm run prod"]

FROM build as dev

RUN apt-get update -y && apt-get install -y openssl libc6


COPY --from=deps /app/node_modules ./node_modules

WORKDIR /app

COPY package.json ./

CMD ["sh", "-c", "npm run dev"]
