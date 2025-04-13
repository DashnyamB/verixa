import { PrismaClient } from "@prisma/client";
import { env } from "./env";

const isDev = env.nodeEnv === "development";

const prisma = new PrismaClient({
  log: isDev ? ["query", "info", "warn", "error"] : ["error"],
});

export default prisma;