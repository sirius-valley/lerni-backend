export const configuration = () => ({
  NODE_ENV: process.env.NODE_ENV ?? "development",
  ENVIRONMENT: process.env.ENVIRONMENT,

});