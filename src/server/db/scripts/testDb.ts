import { env } from "@/env";
import mysql from "mysql2/promise";
const connection = await mysql.createConnection({
    uri: env.DATABASE_URL,
});





async function initDb() {
    try {
        





    }
    catch (error) {
        console.error('Error initializing database:', error)
    }
    finally {
        await connection.end()
    }
}

initDb()