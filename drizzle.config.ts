import { type Config } from "drizzle-kit";

import { env } from "@/env";
console.log(env.DATABASE_URL,'db url');
export default {
  schema: "./src/server/db/schema",
  dialect: "mysql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  out: './src/server/db/migrations',
  tablesFilter: ["test_*"],
} satisfies Config;
