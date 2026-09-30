import { config } from "dotenv";
import path from "node:path";
config({
  path: path.resolve(process.cwd(), "../database/.env"),
});

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@repo/database"; // your prisma client instance

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "sqlite", ...etc
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "PROGRAMMER",
        required: false,
      },
    },
  },
});
