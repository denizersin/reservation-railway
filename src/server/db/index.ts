import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import {schema} from "./schema";
import { env } from "@/env";

export const connection = await mysql.createConnection({
    uri: env.DATABASE_URL,
});
export const db = drizzle(connection, {
    schema,
    mode: 'default',
});



