import { env } from "@/env";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../schema/index";

import { reservationUseCases } from "@/server/layer/use-cases/reservation";
import { eq, isNotNull } from "drizzle-orm";
import { ReservationEntities } from "@/server/layer/entities/reservation";


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



function getMonthDays(startDate: Date, endDate: Date) {
    const days: Date[] = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        days.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
}




async function initDb() {
    try {


        const limitationquery =await ReservationEntities.getLimitationStatuesQuery({
            date: new Date(),
            mealId: 3,
            restaurantId: 1
        })

        console.log(limitationquery, 'limitationquery')

    } catch (error) {
        console.error('Error initializing database:', error)
    }
    finally {
        await connection.end()
    }
}

initDb()



// console.log(env.DATABASE_URL)