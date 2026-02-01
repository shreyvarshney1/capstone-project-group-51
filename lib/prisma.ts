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
  // Handle 'pg' SSL warning by ensuring we use compatible modes in dev
  let connectionString = process.env.DATABASE_URL;

  if (process.env.NODE_ENV !== "production" && connectionString) {
    try {
      // Append parameters to silence the warning while maintaining dev functionality
      const url = new URL(connectionString);
      // 'uselibpqcompat=true' restores legacy behavior where 'require' didn't enforce valid CA
      // avoiding the "SECURITY WARNING" about loose aliases.
      url.searchParams.set("uselibpqcompat", "true");
      // Ensure we are in a mode that works with rejectUnauthorized: false
      if (!url.searchParams.has("sslmode")) {
        url.searchParams.set("sslmode", "require");
      }
      connectionString = url.toString();
    } catch (e) {
      // Fallback if URL parsing fails
      console.warn("Failed to patch DATABASE_URL for SSL compat:", e);
    }
  }

  // Configure the PostgreSQL connection pool
  const pool = new Pool({
    connectionString,
    ssl:
      process.env.NODE_ENV === "production"
        ? true
        : { rejectUnauthorized: false },
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
