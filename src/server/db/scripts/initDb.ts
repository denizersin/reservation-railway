import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { schema } from "../schema";
import { env } from "@/env";
import { EnumUserRole, tblUser } from "../schema/user";
const connection = await mysql.createConnection({
    uri: env.DATABASE_URL,
});
async function createAdmin() {


    const db = drizzle(connection, {
        schema,
        mode: 'default',
    });

    const result = await db.insert(tblUser).values({
        email: 'admin@gmail.com',
        password: 'admin',
        role: EnumUserRole.admin
    }).$returningId()
    if (result[0]?.id) console.log('Admin user created')
}

async function createUser() {
    const db = drizzle(connection, {
        schema,
        mode: 'default',
    });

    const result = await db.insert(tblUser).values({
        email: 'user@gmail.com',
        password: 'user',
        role: EnumUserRole.user
    }).$returningId()
    if (result[0]?.id) console.log('User created')
}

async function initDb() {
    try {

        await createAdmin();
        await createUser();
    }
    catch (error) {
        console.error('Error initializing database:', error)
    }
    finally{
        await connection.end()
    }
}

initDb()