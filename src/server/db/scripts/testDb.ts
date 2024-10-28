import { env } from "@/env";
import { and, between, count, eq, isNotNull, isNull, or, sql, sum } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../schema/index";
import { tblReservationLimitation } from "../schema/resrvation_limitation";
import { tblMealHours } from "../schema/restaurant-assets";
import { tblRoom, tblTable } from "../schema/room";
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

        // await db.update(schema.tblReservation).set({
        //     linkedReservationId: null
        // }).where(
        //     isNotNull(schema.tblReservation.id)
        // )

        // await db.insert(schema.tblLinkedReservations).values({
        //     mainReservationId: 2,
        //     linkedReservationId: 3
        // })

        // await db.update(schema.tblReservation).set({
        //     mainReservationId: 2
        // }).where(
        //     eq(schema.tblReservation.id, 3)
        // )

        // await deleteAllReservations()

        // await db.delete(schema.tblWaitingSessionTables).where(
        //     isNotNull(schema.tblWaitingSessionTables.id)
        // )

        // await db.delete(schema.tblWaitingTableSession).where(
        //     isNotNull(schema.tblWaitingTableSession.id)
        // )
        

        // await db.insert(schema.tblReservationTables).values({
        //     reservationId:2,
        //     tableId:5,

        // })


        // await db.update(schema.tblReservation).set({
        //     guestId: 1
        // }).where(
        //     eq(schema.tblReservation.id, 1)
        // )




    }
    catch (error) {
        console.error('Error initializing database:', error)
    }
    finally {
        await connection.end()
    }
}

initDb()