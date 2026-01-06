FROM oven/bun:1.2.21-slim
WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl

COPY package.json bun.lock ./
COPY packages packages/
COPY apps apps/
COPY infrastructure infrastructure/
COPY modules modules/
COPY services services/
COPY nx.json tsconfig.base.json biome.json ./

RUN bun install

RUN ls -la infrastructure/db/
RUN cat infrastructure/db/package.json

ENV NODE_ENV=production
ENV CI=true
ENV NX_TERMINAL_OUTPUT=static
ENV NX_CLOUD_DISTRIBUTED_EXECUTION=false
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

RUN cd infrastructure/db && bun run generate
RUN bun --cwd packages/internal/prisma-defs run transform

COPY start.sh ./
RUN chmod +x start.sh

EXPOSE 5800
ENV PORT=5800

CMD ["./start.sh"]
