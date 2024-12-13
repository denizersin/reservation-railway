import { config } from 'dotenv'
config()
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string(),
    DATABASE_URL_DEV: z.string(),
    DATABASE_URL_PROD: z.string(),

    JWT_SECRET: z.string(),
    DB_NAME: z.string(),
    IYZIPAY_DEV_API_KEY: z.string(),
    IYZIPAY_DEV_SECRET_KEY: z.string(),
    IYZIPAY_PROD_API_KEY: z.string(),
    IYZIPAY_PROD_SECRET_KEY: z.string(),
    IYZIPAY_DEV_URI: z.string(),
    IYZIPAY_PROD_URI: z.string(),
    IYZIPAY_URI: z.string(),
    IYZIPAY_API_KEY: z.string(),
    IYZIPAY_SECRET_KEY: z.string(),
    DEV_BASE_URL: z.string(),
    PROD_BASE_URL: z.string(),
    BASE_URL: z.string(),
    IYZIPAY_CALLBACK_URL: z.string(),
    NODE_ENV: z.string(),
    NODE_ENV_2: z.string(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_FRONTEND_URL_DEVELOPMENT: z.string().url(),
    // NEXT_PUBLIC_FRONTEND_URL_PRODUCTION: z.string().url(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.NODE_ENV_2 === "production" ? process.env.DATABASE_URL_PROD : process.env.DATABASE_URL_DEV,
    DATABASE_URL_DEV: process.env.DATABASE_URL_DEV,
    DATABASE_URL_PROD: process.env.DATABASE_URL_PROD,
    NODE_ENV: process.env.NODE_ENV,
    NODE_ENV_2: process.env.NODE_ENV_2,
    JWT_SECRET: process.env.JWT_SECRET,
    DB_NAME: process.env.DB_NAME,
    IYZIPAY_DEV_API_KEY: process.env.IYZIPAY_DEV_API_KEY,
    IYZIPAY_DEV_SECRET_KEY: process.env.IYZIPAY_DEV_SECRET_KEY,
    IYZIPAY_PROD_API_KEY: process.env.IYZIPAY_PROD_API_KEY,
    IYZIPAY_PROD_SECRET_KEY: process.env.IYZIPAY_PROD_SECRET_KEY,
    IYZIPAY_DEV_URI: process.env.IYZIPAY_DEV_URI,
    IYZIPAY_PROD_URI: process.env.IYZIPAY_PROD_URI,
    IYZIPAY_URI: process.env.NODE_ENV_2 === "production" ? process.env.IYZIPAY_PROD_URI : process.env.IYZIPAY_DEV_URI,
    IYZIPAY_API_KEY: process.env.NODE_ENV_2 === "production" ? process.env.IYZIPAY_PROD_API_KEY : process.env.IYZIPAY_DEV_API_KEY,
    IYZIPAY_SECRET_KEY: process.env.NODE_ENV_2 === "production" ? process.env.IYZIPAY_PROD_SECRET_KEY : process.env.IYZIPAY_DEV_SECRET_KEY,
    DEV_BASE_URL: process.env.DEV_BASE_URL,
    PROD_BASE_URL: process.env.PROD_BASE_URL,
    BASE_URL: process.env.NODE_ENV_2 === "production" ? process.env.PROD_BASE_URL : process.env.DEV_BASE_URL,
    IYZIPAY_CALLBACK_URL: process.env.NODE_ENV_2 === "production" ? process.env.PROD_BASE_URL + "/api/iyzipay/callback" : process.env.DEV_BASE_URL + "/api/iyzipay/callback",
    // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  // skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  skipValidation: true,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
