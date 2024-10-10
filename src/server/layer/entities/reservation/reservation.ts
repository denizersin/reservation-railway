
import { db } from "@/server/db";
import { tblReservation } from "@/server/db/schema/reservation";
import { tblReservationLimitation } from "@/server/db/schema/resrvation_limitation";
import { tblMealHours } from "@/server/db/schema/restaurant-assets";
import { tblRoom, tblTable } from "@/server/db/schema/room";
import { and, between, count, eq, isNotNull, isNull, or, sql, sum } from "drizzle-orm";


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
    // console.log(test, 'hour avaliabilities')
}



export const getAllAvailableReservation = async () => {

    const now = new Date(); // Current date and time
    console.log(now, 'now')
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

    const avaliableInfo = await getAvaliabels();


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

}