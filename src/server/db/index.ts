import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import  * as schema from "./schema";
import { env } from "@/env";

export const connection = await mysql.createConnection({
    uri: env.DATABASE_URL,
});


export const db = drizzle(connection, {
    schema,
    mode: 'default',
});


console.log("INIT DB2312")

console.log(env.DATABASE_URL, 'database url')
console.log(env.NODE_ENV, 'node env22')
console.log(env.NODE_ENV_2, 'node env22')