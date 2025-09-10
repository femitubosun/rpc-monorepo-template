import Env from '@template/env';
import { Prisma, PrismaClient } from '../prisma/dist/generated/prisma/index.js';
export { Prisma };

const db = new PrismaClient({
  datasources: {
    db: {
      url: Env.DATABASE_URL,
    },
  },
});

export default db;
