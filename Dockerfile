FROM node:18-slim AS deps

RUN apt-get update -y && apt-get install -y openssl libc6

WORKDIR /app


ARG PORT
ARG DATABASE_URL
ARG POSTGRES_USER
ARG POSTGRES_PASSWORD
ARG ENVIRONMENT
ARG JWT_SECRET
ARG SPRING_SERVICE_URL
ARG EMAIL_HOST
ARG EMAIL_USER

ENV DATABASE_URL=${DATABASE_URL}
ENV POSTGRES_USER=${POSTGRES_USER}
ENV POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
ENV ENVIRONMENT=${ENVIRONMENT}
ENV JWT_SECRET=${JWT_SECRET}
ENV SPRING_SERVICE_URL=${SPRING_SERVICE_URL}
ENV EMAIL_HOST=${EMAIL_HOST}
ENV EMAIL_USER=${EMAIL_USER}
ENV PORT=${PORT}


COPY package*.json ./

RUN npm install

COPY prisma ./prisma/
RUN npm run db:generate

FROM deps as build

WORKDIR /app

COPY package.json ./
COPY tsconfig.json ./
COPY nest-cli.json ./
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

CMD ["sh", "-c", "npm run migrate:postgres:deploy && npm run seed:dev && npm run dev"]
