import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  dbInitialized: boolean | undefined;
};

function initDatabaseOnVercel() {
  if (!process.env.VERCEL || globalForPrisma.dbInitialized) return;

  try {
    execSync("npx prisma db push --skip-generate --accept-data-loss", {
      env: { ...process.env, DATABASE_URL: "file:/tmp/dev.db" },
      stdio: "pipe",
      timeout: 15000,
    });
  } catch (e) {
    console.warn("prisma db push failed, tables may already exist:", e);
  }

  globalForPrisma.dbInitialized = true;
}

function createPrismaClient(): PrismaClient {
  initDatabaseOnVercel();

  const url = process.env.VERCEL
    ? "file:/tmp/dev.db"
    : process.env.DATABASE_URL;

  return new PrismaClient({
    datasources: { db: { url } },
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
