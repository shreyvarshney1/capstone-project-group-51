import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// 1. Extend the global object type
// This cleanly adds 'prisma' to the global scope, avoiding "as unknown as" hacks.
declare global {
  var prisma: PrismaClient | undefined;
}

// 2. Define the client creator
// We wrap this in a function so we don't initialize the pool unnecessarily
// if a cached Prisma instance already exists.
const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL;

  // Configure the PostgreSQL connection pool
  const pool = new Pool({
    connectionString,
    // You can add pool settings here if needed, e.g.:
    // max: 10,
    // idleTimeoutMillis: 30000
  });

  // Create the driver adapter
  const adapter = new PrismaPg(pool);

  // Return the Prisma Client instance
  return new PrismaClient({
    adapter,
    // Optional: Enable log logging
    // log: ['query', 'info', 'warn', 'error'],
  });
};

// 3. Export the singleton instance
// If we're in development and 'global.prisma' exists, use it.
// Otherwise, create a new one.
export const prisma = global.prisma ?? createPrismaClient();

// 4. Cache the instance in development
// This prevents Next.js hot-reloading from creating thousands of database connections.
if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
