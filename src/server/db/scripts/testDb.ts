import { env } from "@/env";
import { isNotNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../schema/index";
const connection = await mysql.createConnection({
    uri: env.DATABASE_URL,
});

const db = drizzle(connection, {
    schema,
    mode: 'default',
});


async function deleteAllReservations() {
    await db.delete(schema.tblReservation).where(
        isNotNull(schema.tblReservation.id)
    )
}





async function initDb() {
    try {
        await deleteAllReservations();
    } catch (error) {
        console.error('Error initializing database:', error)
    }
    finally {
        await connection.end()
    }
}

initDb()
