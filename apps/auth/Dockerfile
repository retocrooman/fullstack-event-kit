# BUILDER
FROM node:23-bullseye-slim AS builder

# Install ca-certificates for planet-scale ssl
# RUN apt-get update && apt-get install -y ca-certificates && update-ca-certificates

WORKDIR /workspace

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY turbo.json ./
COPY ./apps/auth/package.json ./apps/auth/
COPY ./apps/auth/tsconfig.json ./apps/auth/
COPY ./apps/auth/tsconfig.build.json ./apps/auth/
COPY ./apps/auth/nest-cli.json ./apps/auth/
COPY ./apps/auth/eslint.config.mjs ./apps/auth/
COPY ./apps/auth/jest.config.ts ./apps/auth/
COPY ./packages ./packages
COPY ./scripts ./scripts

ARG HOST
ARG DATABASE_URL
ARG JWT_PRIVATE_KEY
ARG JWT_PUBLIC_KEY
ARG BETTER_AUTH_SECRET

RUN npm i -g pnpm@10.2.0
RUN pnpm i

COPY ./apps/auth/src ./apps/auth/src
COPY ./apps/auth/prisma ./apps/auth/prisma

RUN pnpm --filter auth db:generate
RUN pnpm --filter auth build
# NOTICE: Use migration instead of db:push in production  
# RUN pnpm --filter auth db:push  # Skipped in container build - requires database
# RUN pnpm --filter auth test     # Skipped in container build - requires database
RUN pnpm run remove-node-modules
RUN pnpm --filter auth add prisma@6.11.1
RUN pnpm --filter auth db:generate
RUN pnpm i --prod

# Production image
FROM node:23-bullseye-slim AS runner

ENV TZ=utc

# Install ca-certificates
# RUN apt-get update && apt-get install -y ca-certificates && update-ca-certificates

WORKDIR /workspace

COPY --from=builder /workspace/package.json /workspace/pnpm-lock.yaml /workspace/pnpm-workspace.yaml ./
COPY --from=builder /workspace/node_modules ./node_modules
COPY --from=builder /workspace/apps/auth/package.json ./apps/auth/package.json
COPY --from=builder /workspace/apps/auth/dist ./apps/auth/dist
COPY --from=builder /workspace/apps/auth/node_modules ./apps/auth/node_modules
COPY --from=builder /workspace/apps/auth/prisma ./apps/auth/prisma
COPY --from=builder /workspace/packages ./packages

WORKDIR /workspace/apps/auth

EXPOSE 4000

CMD [ "node", "dist/main.js" ]