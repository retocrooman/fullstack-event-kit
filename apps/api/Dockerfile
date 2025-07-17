# BUILDER
FROM node:23-bullseye-slim AS builder

# Install ca-certificates for planet-scale ssl
# RUN apt-get update && apt-get install -y ca-certificates && update-ca-certificates

WORKDIR /workspace

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY turbo.json ./
COPY ./apps/api/package.json ./apps/api/
COPY ./apps/api/tsconfig.json ./apps/api/
COPY ./apps/api/tsconfig.build.json ./apps/api/
COPY ./apps/api/eslint.config.mjs ./apps/api/
COPY ./apps/api/jest.config.ts ./apps/api/
COPY ./packages ./packages
COPY ./scripts ./scripts

ARG HOST
ARG DATABASE_URL

RUN npm i -g pnpm@10.2.0
RUN pnpm i

COPY ./apps/api/src ./apps/api/src
COPY ./apps/api/test ./apps/api/test
COPY ./apps/api/prisma ./apps/api/prisma

RUN pnpm run api build
# NOTICE: Use migration instead of db:push in production
RUN pnpm run api db:push
RUN pnpm run api test
RUN pnpm run remove-node-modules
RUN pnpm run api add prisma@5.15.1
RUN pnpm run api prisma generate
RUN pnpm i --prod

# Production image
FROM node:23-bullseye-slim AS runner

ENV TZ=utc

# Install ca-certificates
# RUN apt-get update && apt-get install -y ca-certificates && update-ca-certificates

WORKDIR /workspace

COPY --from=builder /workspace/package.json /workspace/pnpm-lock.yaml /workspace/pnpm-workspace.yaml ./
COPY --from=builder /workspace/node_modules ./node_modules
COPY --from=builder /workspace/apps/api/package.json ./apps/api/package.json
COPY --from=builder /workspace/apps/api/dist ./apps/api/dist
COPY --from=builder /workspace/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /workspace/apps/api/prisma ./apps/api/prisma
COPY --from=builder /workspace/packages ./packages

WORKDIR /workspace/apps/api

CMD [ "node", "dist/main.js" ]