import Env from '@template/env';
import { PrismaClient } from '../prisma/dist/generated/prisma/index.js';

const db = new PrismaClient({
  datasources: {
    db: {
      url: Env.DATABASE_URL,
    },
  },
});

export default db;
