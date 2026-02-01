// prisma.config.ts
import "dotenv/config";
import { defineConfig } from "@prisma/config";

export default defineConfig({
  datasource: {
    // This is where the CLI gets the URL for migrations/studio
    url: process.env.DATABASE_URL,
  },
});
