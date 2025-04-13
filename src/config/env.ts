if (!process.env.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL is missing");
}
if (!process.env.JWT_SECRET) {
  throw new Error("❌ JWT_SECRET is missing");
}
if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error("❌ GOOGLE_CLIENT_ID is missing");
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error("❌ GOOGLE_CLIENT_SECRET is missing");
}

export const env = {
  databaseUrl: process.env.DATABASE_URL!,
  jwtSecret: process.env.JWT_SECRET!,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
  APP_URL: process.env.APP_URL || "http://localhost:4000",
  port: process.env.PORT ? Number(process.env.PORT) : 3000,
  nodeEnv: process.env.NODE_ENV || "development",
};
