import { config } from "dotenv";
config();

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@repo/database"; // your prisma client instance

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "sqlite", ...etc
  }),
  trustedOrigins: [
    process.env.CLIENT_URL_1 ||
      process.env.CLIENT_URL_2 ||
      "http://localhost:5173" ||
      "http://localhost:5174",
  ],
  emailAndPassword: {
    enabled: true,
  },
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
