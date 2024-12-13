import { type Config } from "drizzle-kit";

import { env } from "@/env";


export default {
  schema: "./src/server/db/schema/**/*.ts",
  dialect: "mysql",
  dbCredentials: {
    url: env.DATABASE_URL
  },
  out: './src/server/db/migrations',
  tablesFilter: ["test_*"],
} satisfies Config;
