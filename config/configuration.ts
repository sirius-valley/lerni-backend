import * as process from 'process';

export const configuration = () => ({
  NODE_ENV: process.env.NODE_ENV ?? "development",
  ENVIRONMENT: process.env.ENVIRONMENT,
  JWT_SECRET: process.env.JWT_SECRET,
  PORT: process.env.PORT ?? 3000,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  EMAIL_HOST: process.env.EMAIL_HOST,
});
