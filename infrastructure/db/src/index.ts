import { PrismaPg } from '@prisma/adapter-pg';
import Env from '@template/env';
import pg from 'pg';
import { Prisma, PrismaClient } from '../prisma/dist/generated/prisma/index.js';

export { Prisma };

const pool = new pg.Pool({
  connectionString: Env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const db = new PrismaClient({ adapter });

export default db;
