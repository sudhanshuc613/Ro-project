/**
 * Prisma singleton.
 * Next.js dev mode hot-reloads modules; without the global cache you leak a new
 * PgPool per reload and exhaust Postgres connections within minutes.
 */
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'warn', 'error']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/** Graceful shutdown for long-running Node hosts (not needed on Vercel). */
export async function disconnectPrisma() {
  await prisma.$disconnect();
}
