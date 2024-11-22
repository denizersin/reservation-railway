import { db } from "@/server/db";
import { tblReservation, tblReservationTable } from "@/server/db/schema/reservation";
import { tblReservationLimitation } from "@/server/db/schema/resrvation_limitation";
import { getLocalTime, getStartAndEndOfDay } from "@/server/utils/server-utils";
import { EnumReservationStatusNumeric } from "@/shared/enums/predefined-enums";
import { and, between, count, eq, isNotNull, isNull, ne, sql, sum } from "drizzle-orm";

import { ReservationEntities } from ".";
import { tblRoom, tblTable, TTable } from "@/server/db/schema";



export function getLimitationStatuesQuery({ date, mealId, restaurantId }: { date: Date, mealId: number, restaurantId: number }) {

    const { start, end } = getStartAndEndOfDay({
        date:
            getLocalTime(date)
    })


    return db
        .select({
            limitationId: tblReservationLimitation.id,
            hour: tblReservationLimitation.hour,
            meal: tblReservationLimitation.mealId,
            room: tblReservationLimitation.roomId,
            maxTable: tblReservationLimitation.maxTableCount,
            maxGuest: tblReservationLimitation.maxGuestCount,
            // totalTable: count(tblReservation.id).as('totalTable'),
            totalTable: sql`count(${tblReservation.id})`.as('totalTable'),
            // totalGuest: sum(tblReservation.guestCount).as('totalGuest'),
            totalGuest: sql<number>`cast(${sum(tblReservation.guestCount)} as SIGNED)`.as('totalGuest'),
            // avaliableGuest: sql`${tblReservationLimitation.maxGuestCount} - ${sum(tblReservation.guestCount)}`.as('avaliableGuest'),
            avaliableGuest: sql<number>`${tblReservationLimitation.maxGuestCount} - cast(${sum(tblReservation.guestCount)} as SIGNED)`.as('availableGuest'),

            avaliableTable: sql<number>`${tblReservationLimitation.maxTableCount} - ${(count(tblReservation.id))}`.as('avaliableTable'),
        })
        .from(tblReservationLimitation)
        .leftJoin(tblReservation,
            and(
                eq(tblReservationLimitation.restaurantId, tblReservation.restaurantId),


                eq(tblReservation.roomId, tblReservationLimitation.roomId),
                eq(tblReservationLimitation.mealId, tblReservation.mealId),

                ne(tblReservation.reservationStatusId, EnumReservationStatusNumeric.cancel),

                //equal
                between(tblReservation.hour, tblReservationLimitation.minHour, tblReservationLimitation.maxHour),

                between(tblReservation.reservationDate, start, end),

                eq(tblReservation.hour, tblReservationLimitation.hour),
            )
        )
        .where(
            and(
                eq(tblReservationLimitation.restaurantId, restaurantId),
                eq(tblReservationLimitation.mealId, mealId),
                eq(tblReservationLimitation.isActive, true),
            )
        )
        .groupBy(tblReservationLimitation.id)
}


export async function getLimitationStatusByHour({ date, mealId, restaurantId, utcHour }: { date: Date, mealId: number, restaurantId: number, utcHour: string }) {
    const { start, end } = getStartAndEndOfDay({
        date:
            getLocalTime(date)
    })


    const result = await db
        .select({
            limitationId: tblReservationLimitation.id,
            hour: tblReservationLimitation.hour,
            meal: tblReservationLimitation.mealId,
            room: tblReservationLimitation.roomId,
            maxTable: tblReservationLimitation.maxTableCount,
            maxGuest: tblReservationLimitation.maxGuestCount,
            // totalTable: count(tblReservation.id).as('totalTable'),
            totalTable: sql`count(${tblReservation.id})`.as('totalTable'),
            // totalGuest: sum(tblReservation.guestCount).as('totalGuest'),
            totalGuest: sql<number>`cast(${sum(tblReservation.guestCount)} as SIGNED)`.as('totalGuest'),
            // avaliableGuest: sql`${tblReservationLimitation.maxGuestCount} - ${sum(tblReservation.guestCount)}`.as('avaliableGuest'),
            avaliableGuest: sql<number>`${tblReservationLimitation.maxGuestCount} - cast(${sum(tblReservation.guestCount)} as SIGNED)`.as('availableGuest'),

            avaliableTable: sql<number>`${tblReservationLimitation.maxTableCount} - ${(count(tblReservation.id))}`.as('avaliableTable'),
        })
        .from(tblReservationLimitation)
        .leftJoin(tblReservation,
            and(
                eq(tblReservationLimitation.restaurantId, tblReservation.restaurantId),


                eq(tblReservation.roomId, tblReservationLimitation.roomId),
                eq(tblReservationLimitation.mealId, tblReservation.mealId),

                ne(tblReservation.reservationStatusId, EnumReservationStatusNumeric.cancel),

                //equal
                // between(tblReservation.hour, tblReservationLimitation.minHour, tblReservationLimitation.maxHour),
                eq(tblReservation.hour, utcHour),

                between(tblReservation.reservationDate, start, end),

                eq(tblReservation.hour, tblReservationLimitation.hour),
            )
        )
        .where(
            and(
                eq(tblReservationLimitation.restaurantId, restaurantId),
                eq(tblReservationLimitation.hour, utcHour),
                eq(tblReservationLimitation.mealId, mealId),
                eq(tblReservationLimitation.isActive, true),
            )
        )
        .groupBy(tblReservationLimitation.id)

    return result[0]
}


export const getAvaliableTable = async ({
    restaurantId,
    date,
    utcHour,
    guestCount,
    mealId
}: {
    restaurantId: number,
    date: Date,
    utcHour: string,
    guestCount: number,
    mealId: number
}) => {

    const { start, end } = getStartAndEndOfDay({
        date:
            getLocalTime((new Date(date)))
    })


    const limitationStatus = await ReservationEntities.getLimitationStatusByHour({
        restaurantId,
        mealId,
        date,
        utcHour
    })


    const getReservationTables = () => db
        .select({
            RESERVATION_TABLE_ID: tblReservationTable.id,
            RESERVATION_ID: tblReservationTable.reservationId,
            TABLE_ID: tblReservationTable.tableId,
        })
        .from(tblReservation)
        .leftJoin(tblReservationTable, eq(tblReservationTable.reservationId, tblReservation.id))
        .where(
            and(
                eq(tblReservation.mealId, mealId),
                between(tblReservation.reservationDate, start, end),
                ne(tblReservation.reservationStatusId, EnumReservationStatusNumeric.cancel),
                ne(tblReservation.reservationStatusId, EnumReservationStatusNumeric.completed)

            )
        )

    const reservationTables = getReservationTables().as('reservationTables')

    const TEST = await db
        .select()
        .from(tblRoom)
        .leftJoin(tblTable, eq(tblTable.roomId, tblRoom.id))
        .leftJoin(reservationTables, eq(reservationTables.TABLE_ID, tblTable.id))
        .leftJoin(tblReservation, and(
            eq(tblReservation.id, reservationTables.RESERVATION_ID),
        ))
        .leftJoin(tblReservationTable, eq(tblReservationTable.id, reservationTables.RESERVATION_TABLE_ID))
        .where(and(
            eq(tblRoom.restaurantId, restaurantId),
            eq(tblRoom.isWaitingRoom, false),
            isNotNull(tblTable.id),
            isNull(tblReservation.id)
        ))


    //return most appropriate table for guest count

    // guest count:3  tables: 2-4 2-5 return 2-4

    let mostAppropriateTable: TTable | undefined = undefined

    TEST.forEach(r => {
        if (r.table?.id) {
            const table = r.table
            const isTableAvaliable = table.maxCapacity >= guestCount && table.minCapacity <= guestCount
            if (!isTableAvaliable) return;

            if (!mostAppropriateTable) {
                mostAppropriateTable = table
            }

            if (isTableAvaliable && table.maxCapacity < mostAppropriateTable.maxCapacity) {
                mostAppropriateTable = table
            }

        }
    })


    return mostAppropriateTable as TTable | undefined

}

export const queryTableAvailability = async ({
    restaurantId,
    date,
    mealId,
    tableId
}: {
    restaurantId: number,
    date: Date,
    mealId: number,
    tableId: number
}): Promise<boolean> => {

    const { start, end } = getStartAndEndOfDay({
        date: getLocalTime((new Date(date)))
    })
    console.log(start, end, 'start end')

    const getReservationTables = () => db
        .select({
            RESERVATION_TABLE_ID: tblReservationTable.id,
            RESERVATION_ID: tblReservationTable.reservationId,
            TABLE_ID: tblReservationTable.tableId,
        })
        .from(tblReservation)
        .leftJoin(tblReservationTable, eq(tblReservationTable.reservationId, tblReservation.id))
        .where(
            and(
                eq(tblReservation.mealId, mealId),
                between(tblReservation.reservationDate, start, end),
                ne(tblReservation.reservationStatusId, EnumReservationStatusNumeric.cancel),
                ne(tblReservation.reservationStatusId, EnumReservationStatusNumeric.completed)

            )
        )

    const reservationTables = getReservationTables().as('reservationTables')

    const TEST = await db
        .select()
        .from(tblRoom)
        .leftJoin(tblTable, eq(tblTable.roomId, tblRoom.id))
        .leftJoin(reservationTables, eq(reservationTables.TABLE_ID, tblTable.id))
        .leftJoin(tblReservation, and(
            eq(tblReservation.id, reservationTables.RESERVATION_ID),
        ))
        .leftJoin(tblReservationTable, eq(tblReservationTable.id, reservationTables.RESERVATION_TABLE_ID))
        .where(and(
            eq(tblTable.id, tableId),
            eq(tblRoom.restaurantId, restaurantId),
            eq(tblRoom.isWaitingRoom, false),
            isNotNull(tblTable.id),
            isNull(tblReservation.id),

        ))

    const isTableAvaliable = TEST.length === 0

    return isTableAvaliable

}


export async function queryHourAvaliability({ date, mealId, restaurantId, utcHour, guestCount

}: { date: Date, mealId: number, restaurantId: number, utcHour: string, guestCount: number }) {
    const { start, end } = getStartAndEndOfDay({
        date:
            getLocalTime(date)
    })


    const result = await db
        .select({
            limitationId: tblReservationLimitation.id,
            hour: tblReservationLimitation.hour,
            meal: tblReservationLimitation.mealId,
            room: tblReservationLimitation.roomId,
            maxTable: tblReservationLimitation.maxTableCount,
            maxGuest: tblReservationLimitation.maxGuestCount,
            // totalTable: count(tblReservation.id).as('totalTable'),
            totalTable: sql`count(${tblReservation.id})`.as('totalTable'),
            // totalGuest: sum(tblReservation.guestCount).as('totalGuest'),
            totalGuest: sql<number>`cast(${sum(tblReservation.guestCount)} as SIGNED)`.as('totalGuest'),
            // avaliableGuest: sql`${tblReservationLimitation.maxGuestCount} - ${sum(tblReservation.guestCount)}`.as('avaliableGuest'),
            avaliableGuest: sql<number>`${tblReservationLimitation.maxGuestCount} - cast(${sum(tblReservation.guestCount)} as SIGNED)`.as('availableGuest'),

            avaliableTable: sql<number>`${tblReservationLimitation.maxTableCount} - ${(count(tblReservation.id))}`.as('avaliableTable'),
        })
        .from(tblReservationLimitation)
        .leftJoin(tblReservation,
            and(
                eq(tblReservationLimitation.restaurantId, tblReservation.restaurantId),


                eq(tblReservation.roomId, tblReservationLimitation.roomId),
                eq(tblReservationLimitation.mealId, tblReservation.mealId),

                ne(tblReservation.reservationStatusId, EnumReservationStatusNumeric.cancel),

                //equal
                // between(tblReservation.hour, tblReservationLimitation.minHour, tblReservationLimitation.maxHour),
                eq(tblReservation.hour, utcHour),

                between(tblReservation.reservationDate, start, end),

                eq(tblReservation.hour, tblReservationLimitation.hour),
            )
        )
        .where(
            and(
                eq(tblReservationLimitation.restaurantId, restaurantId),
                eq(tblReservationLimitation.hour, utcHour),
                eq(tblReservationLimitation.mealId, mealId),
                eq(tblReservationLimitation.isActive, true),
            )
        )
        .groupBy(tblReservationLimitation.id)
    const limitationStatus = result[0]

    const isAvaliable = !limitationStatus ||
        (limitationStatus.avaliableTable > 0 &&
            limitationStatus.avaliableGuest >= guestCount)

    return isAvaliable
}


