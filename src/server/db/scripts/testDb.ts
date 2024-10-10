import { env } from "@/env";
import { and, between, count, eq, isNotNull, isNull, or, sql, sum } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { schema } from "../schema/index";
import { tblReservation } from "../schema/reservation";
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
    await db.delete(tblReservation).where(
        isNotNull(tblReservation.id)
    )
}

async function getAvaliabels() {
    const now = new Date(); // Current date and time
    const until = new Date();
    until.setHours(24, 0, 0, 0); // Set to the end of the current day (00:00 of the next day)
    const test = await db
        .select({
            limitationId: tblReservationLimitation.id,
            hour: tblReservationLimitation.hour,
            room: tblReservationLimitation.roomId,
            totalTable: count(tblReservation.id).as('totalTable'),
            // totalGuest: sum(tblReservation.guestCount).as('totalGuest'),
            totalGuest: sql`cast(${sum(tblReservation.guestCount)} as UNSIGNED)`.as('totalGuest'),
            // avaliableGuest: sql`${tblReservationLimitation.maxGuestCount} - ${sum(tblReservation.guestCount)}`.as('avaliableGuest'),
            avaliableGuest: sql`${tblReservationLimitation.maxGuestCount} - cast(${sum(tblReservation.guestCount)} as UNSIGNED)`.as('availableGuest'),

            avaliableTable: sql`${tblReservationLimitation.maxTableCount} - ${(count(tblReservation.id))}`.as('avaliableTable'),
        })
        .from(tblReservationLimitation)
        .leftJoin(tblReservation,
            and(
                eq(tblReservationLimitation.restaurantId, tblReservation.restaurantId),
                between(tblReservation.hour, tblReservationLimitation.minHour, tblReservationLimitation.maxHour),
            )
        )
        .where(
            and(
                between(tblReservation.reservationDate, now, until),
                eq(tblReservationLimitation.isActive, true)

            )
        )
        .groupBy(tblReservationLimitation.id)

    console.log(test, 'hour avaliabilities')
}

async function initDb() {
    try {


        // restaurantEntities.createRestaurant({
        //     restaurant: {
        //         name: 'restaurant',
        //         phoneNumber: '123456789',
        //         translations: []
        //     }
        // })


        //avaliable tables
        const result = await db
            .select()
            .from(tblRoom)
            .leftJoin(tblTable, eq(tblTable.roomId, tblRoom.id))
            .leftJoin(tblReservation, eq(tblReservation.tableId, tblTable.id))
            .where(and(
                eq(tblRoom.restaurantId, 2),
                isNull(tblReservation.id)
            ));



        // const tables = result.map(r => ({
        //     roomId: r.room.id,
        //     tableId: r.table?.id,
        //     reservationId: r.reservation?.id
        // }))

        // console.log(result, 'result')

        // console.log('total:', tables.length)

        // console.log(tables, 'tables')


        //all rooms //all days
        // const result2 = await db
        //     .select()
        //     .from(tblMealHours)
        //     .leftJoin(tblReservationLimitation, eq(tblReservationLimitation.roomId, tblReservation.roomId))
        //     .leftJoin(tblReservation,
        //         and(
        //             eq(tblReservationLimitation.hour, tblReservation.hour),

        //         )
        //     )
        //     .where(
        //         and(
        //             isNull(tblReservationLimitation.roomId),
        //             isNull(tblReservationLimitation.day),
        //             eq(tblReservationLimitation.isActive, true),
        //         )
        //     )



        const now = new Date(); // Current date and time
        const until = new Date();
        until.setHours(24, 0, 0, 0); // Set to the end of the current day (00:00 of the next day)

        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 2);

        const tomorrow = new Date();
        tomorrow.setDate(now.getDate() + 1);

        const limitedAvailableHours = await db
            .select({
                limitationId: tblReservationLimitation.id,
                hour: tblReservationLimitation.hour,
                room: tblReservationLimitation.roomId,
                // totalTable: count(tblReservation.id).as('totalTable'),
                totalTable: sql`count(${tblReservation.id})`.as('totalTable'),
                // totalGuest: sum(tblReservation.guestCount).as('totalGuest'),
                totalGuest: sql<number>`cast(${sum(tblReservation.guestCount)} as UNSIGNED)`.as('totalGuest'),
                // avaliableGuest: sql`${tblReservationLimitation.maxGuestCount} - ${sum(tblReservation.guestCount)}`.as('avaliableGuest'),
                avaliableGuest: sql<number>`${tblReservationLimitation.maxGuestCount} - cast(${sum(tblReservation.guestCount)} as UNSIGNED)`.as('availableGuest'),

                avaliableTable: sql<number>`${tblReservationLimitation.maxTableCount} - ${(count(tblReservation.id))}`.as('avaliableTable'),
            })
            .from(tblReservationLimitation)
            .leftJoin(tblReservation,
                and(
                    eq(tblReservationLimitation.restaurantId, tblReservation.restaurantId),
                    between(tblReservation.hour, tblReservationLimitation.minHour, tblReservationLimitation.maxHour),
                )
            )
            .where(
                and(
                    between(tblReservation.reservationDate, now, until),
                    eq(tblReservationLimitation.isActive, true)
                )
            )
            .groupBy(tblReservationLimitation.id).as('limitedAvailableHours')

        await getAvaliabels();


        const TEST = await db
            .select()
            .from(tblRoom)
            .leftJoin(tblTable, eq(tblTable.roomId, tblRoom.id))
            .leftJoin(tblReservation, eq(tblReservation.tableId, tblTable.id))
            .leftJoin(tblMealHours, isNotNull(tblMealHours.id))
            .leftJoin(limitedAvailableHours, and(eq(tblMealHours.hour, limitedAvailableHours.hour), eq(tblRoom.id, limitedAvailableHours.room)))

            .where(and(
                eq(tblRoom.restaurantId, 2),
                isNull(tblReservation.id), // remove to get all reservations 
                or(
                    isNull(limitedAvailableHours.hour),
                    and(
                        eq(tblMealHours.hour, limitedAvailableHours.hour),
                        between(limitedAvailableHours.avaliableGuest, tblTable.minCapacity, tblTable.maxCapacity),
                        //case: avaliable 3    min-2 max-5  (filter them after query) table-max will be 3
                    )
                )
            ))


        TEST.forEach(r => {
            if (
                (r.limitedAvailableHours && r.table) //table has limitation
                &&
                //case: avaliable 3    min-2 max-5 then table-max will be 3
                (
                    r.table.minCapacity <= r.limitedAvailableHours.avaliableGuest &&
                    r.limitedAvailableHours.avaliableGuest < r.table?.maxCapacity
                )) {
                r.table.maxCapacity = r.limitedAvailableHours.avaliableGuest
            }
        })



        // await deleteAllReservations()




        const result3 = await db
            .select()
            .from(tblTable)
            .leftJoin(tblRoom, eq(tblTable.roomId, tblRoom.id))
            .leftJoin(
                tblReservationLimitation,
                and(
                    eq(tblReservationLimitation.restaurantId, tblRoom.restaurantId),
                    isNull(tblReservationLimitation.day),
                    isNull(tblReservationLimitation.roomId)
                )
            )
            .leftJoin(
                tblMealHours,
                and(
                    eq(tblMealHours.restaurantId, tblRoom.restaurantId),
                    between(tblMealHours.hour, tblReservationLimitation.minHour, tblReservationLimitation.maxHour)
                )
            )
        // .leftJoin(
        //     tblReservation,
        //     and(
        //         eq(tblReservation.roomId, tblRoom.id),
        //         eq(tblReservation.hour, tblMealHours.hour)
        //     )
        // )
        // .where(
        //     and(
        //         sql`${tblReservationLimitation.maxTableCount} > (
        //         SELECT COUNT(*) FROM ${tblTable} AS t2 WHERE t2.room_id = ${tblRoom.id}
        //       )`,
        //         sql`${tblReservationLimitation.maxGuestCount} > ${tblTable.maxCapacity}`
        //     )
        // );






    }
    catch (error) {
        console.error('Error initializing database:', error)
    }
    finally {
        await connection.end()
    }
}

initDb()