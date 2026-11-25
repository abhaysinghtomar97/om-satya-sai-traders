// src/lib/prisma.js
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = process.env.NEON_DB_URL; // <-- Apna .env variable name yahan check karein
if (!connectionString) {
  throw new Error('Database URL missing in .env file!');
}
const globalForPrisma = globalThis;

function createPrismaClient() {
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}