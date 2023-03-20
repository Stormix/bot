FROM node:18-alpine AS base

RUN npm i -g pnpm

FROM base AS dependencies

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/language/package.json ./packages/language/
COPY packages/bot/package.json ./packages/bot/
COPY packages/bot/prisma/schema.prisma ./packages/bot/prisma/

RUN pnpm install --frozen-lockfile

FROM dependencies AS build

WORKDIR /app

COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/packages/language/node_modules ./packages/language/node_modules
COPY --from=dependencies /app/packages/bot/node_modules ./packages/bot/node_modules

RUN pnpm run build

WORKDIR /app/packages/bot
EXPOSE 3000

CMD ["pnpm", "run", "start"]
