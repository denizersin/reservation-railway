import { env } from "@/env";
import mysql from "mysql2/promise";
import { EnumUserRole, tblUser } from "../schema/user";
import { drizzle } from "drizzle-orm/mysql2";
import { schema } from "../schema";


const connection = await mysql.createConnection({
    uri: env.DATABASE_URL,
});


try {
    await connection.query(`DROP DATABASE IF EXISTS ${env.DB_NAME}`);
    console.log(`Database ${env.DB_NAME} dropped if it existed.`);

    await connection.query(`CREATE DATABASE ${env.DB_NAME}`);
    console.log(`Database ${env.DB_NAME} created.`);

    // await createAdmin();


} catch (error) {
    console.error("Error recreating database:", error);
} finally {
    await connection.end();
}




