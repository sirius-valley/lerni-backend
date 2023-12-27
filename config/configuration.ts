export const configuration = () => ({
  NODE_ENV: process.env.NODE_ENV ?? "development",
  ENVIRONMENT: process.env.ENVIRONMENT,
  PORT: process.env.PORT ?? 3000
});
