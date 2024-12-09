import { env } from "@/env";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../schema/index";

import { queryTableAvailabilitiesByGuestCount } from "@/server/layer/use-cases/reservation/client-queries";
import { count, isNotNull } from "drizzle-orm";
import { exit } from "process";


const connection = await mysql.createConnection({
    uri: env.DATABASE_URL,
});

const db = drizzle(connection, {
    schema,
    mode: 'default',
});

console.log(env.DATABASE_URL, 'database url')

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
        const startDate = new Date()
        let total = 0;

        const dates = Array.from({ length: 1 }, (_, i) => {
            const date = new Date(startDate)
            date.setDate(date.getDate() + i)
            return date
        })

        const totalStart = performance.now()

        const results = await Promise.all(dates.map(async (date) => {
            const start = performance.now()
            const s = await queryTableAvailabilitiesByGuestCount({
                date,
                mealId: 3,
                restaurantId: 1,
                guestCount: 2
            })
            const end = performance.now()
            return {
                date: date.toISOString().split('T')[0],
                queryTime: end - start
            }
        }))

        const totalEnd = performance.now()

        results.forEach(({ date, queryTime }) => {
            console.log(`Query time for ${date}: ${queryTime.toFixed(2)}ms`)
        })

        total += results.reduce((acc, { queryTime }) => acc + queryTime, 0)

        console.log(`Total time for all queries: ${(totalEnd - totalStart).toFixed(2)}ms`)


        console.log('avarage time for one query', (total / results.length).toFixed(2), 'ms')

        console.log(
            await db.select({ count: count() }).from(schema.tblReservation)
        )


        


    } catch (error) {
        console.error('Error initializing database:', error)
    }
    finally {
        await connection.end()
        console.log('exit')
        exit();
    }
}

// initDb()


// function testMail() {
//     mailService.sendMail3({

//     }).then((res) => {
//         console.log(res)
//     }).catch((err) => {
//         console.error(err)
//     })
// }

// testMail()



// console.log(env.DATABASE_URL)

console.log(
    Object.entries(env)
)

