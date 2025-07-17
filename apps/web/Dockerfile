# BUILDER
FROM node:23-bullseye-slim AS builder

# Install python3 and build-essential for node-gyp-build
RUN apt-get update && apt-get install -y gcc g++ make python3

WORKDIR /workspace

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY turbo.json ./
COPY ./apps/web/package.json ./apps/web/
COPY ./apps/web/next.config.ts ./apps/web/
COPY ./apps/web/tsconfig.json ./apps/web/
COPY ./apps/web/eslint.config.mjs ./apps/web/
COPY ./apps/web/next-env.d.ts ./apps/web/
COPY ./apps/web/postcss.config.mjs ./apps/web/
COPY ./packages ./packages
COPY ./scripts ./scripts

ARG NEXT_PUBLIC_API_HTTP_URL
ARG NEXT_PUBLIC_HOST

RUN npm i -g pnpm@10.2.0
RUN pnpm i

COPY ./apps/web/src ./apps/web/src
COPY ./apps/web/public ./apps/web/public

RUN pnpm run web build
RUN pnpm run remove-node-modules
RUN pnpm i --prod

# Production image
FROM node:23-bullseye-slim AS runner

ENV TZ=utc

WORKDIR /workspace

COPY --from=builder /workspace/package.json /workspace/pnpm-lock.yaml /workspace/pnpm-workspace.yaml ./
COPY --from=builder /workspace/node_modules ./node_modules
COPY --from=builder /workspace/apps/web/package.json ./apps/web/package.json
COPY --from=builder /workspace/apps/web/.next ./apps/web/.next
COPY --from=builder /workspace/apps/web/public ./apps/web/public
COPY --from=builder /workspace/apps/web/node_modules ./apps/web/node_modules
COPY --from=builder /workspace/apps/web/next.config.ts ./apps/web/next.config.ts
COPY --from=builder /workspace/packages ./packages

WORKDIR /workspace/apps/web

CMD [ "node_modules/next/dist/bin/next", "start" ]