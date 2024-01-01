export const configuration = () => ({
  NODE_ENV: process.env.NODE_ENV ?? "development",
  ENVIRONMENT: process.env.ENVIRONMENT,
  JWT_SECRET: process.env.JWT_SECRET,
  PORT: process.env.PORT ?? 3000,
});
