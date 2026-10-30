import { PrismaClient } from "@prisma/client";

// In Prisma SQLite, relative paths are relative to schema.prisma (prisma/vault.db -> ./vault.db)
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./vault.db";
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
export default db;
