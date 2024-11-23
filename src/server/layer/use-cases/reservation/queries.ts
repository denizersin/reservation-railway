import { groupByWithKeyFn } from "@/lib/utils";
import { db } from "@/server/db";
import { tblGuest, tblReservationHolding, tblRoomTranslation } from "@/server/db/schema";
import { tblReservation, tblReservationTable, tblWaitingTableSession } from "@/server/db/schema/reservation";
import { tblReservationLimitation } from "@/server/db/schema/resrvation_limitation";
import { tblMealHours } from "@/server/db/schema/restaurant-assets";
import { tblRoom, tblTable } from "@/server/db/schema/room";
import { TUseCaseOwnerLayer } from "@/server/types/types";
import { getLocalTime, getMonthDays, getStartAndEndOfDay, utcHourToLocalHour } from "@/server/utils/server-utils";
import { EnumReservationExistanceStatusNumeric, EnumReservationStatusNumeric } from "@/shared/enums/predefined-enums";
import TReservationValidator from "@/shared/validators/reservation";
import { and, asc, between, count, desc, eq, isNotNull, ne, sql, sum } from "drizzle-orm";
import { ReservationEntities } from "../../entities/reservation";



export const getAllAvailableReservations = async ({
    input,
    ctx
}: TUseCaseOwnerLayer<TReservationValidator.getTableStatues>) => {

    const { session: { user: { restaurantId } } } = ctx
    const { start, end } = getStartAndEndOfDay({
        date:
            getLocalTime((new Date(input.date)))
    })

    const limitationStatus = await ReservationEntities.getLimitationStatuesQuery({
        date: getLocalTime(new Date(input.date)),
        mealId: input.mealId,
        restaurantId
    })

    limitationStatus.forEach(r => {
        r.avaliableGuest = r.avaliableGuest ?? r.maxGuest
        r.totalGuest = r.totalGuest ?? 0
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
                eq(tblReservation.mealId, input.mealId),
                between(tblReservation.reservationDate, start, end),
                ne(tblReservation.reservationStatusId, EnumReservationStatusNumeric.cancel)

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
        .leftJoin(tblMealHours, eq(tblMealHours.mealId, input.mealId))
        .leftJoin(tblGuest, eq(tblGuest.id, tblReservation.guestId))
        .leftJoin(tblWaitingTableSession, and(isNotNull(tblReservation.id), eq(tblWaitingTableSession.reservationId, tblReservation.id)))
        .where(and(
            eq(tblRoom.restaurantId, restaurantId),
            isNotNull(tblTable.id),
        ))



    type NewTable = typeof TEST[0]['table'] & {
        isReserved: boolean
        isReachedLimit: boolean
        avaliableGuestWithLimit: number
        isAppliedLimit: boolean
        hour: string
    }


    const tables: NewTable[] = []

    TEST.forEach(rr => {
        if (!rr.table || !rr.meal_hours) return

        const reservation = rr.reservation ? { ...rr.reservation } : null
        const meal_hours = { ...rr.meal_hours }

        const table: NewTable = {
            ...rr.table,
            avaliableGuestWithLimit: rr.table.maxCapacity,
            isReserved: false,
            isReachedLimit: false,
            isAppliedLimit: false,
            hour: meal_hours.hour
        }
        tables.push(table)

        if (
            (reservation)
        ) {
            table.isReserved = true
            return;
        }
        const limited = limitationStatus.find(r => (r.hour === meal_hours.hour && r.room === table.roomId))

        if (!limited) return;

        if (limited.avaliableGuest < table.minCapacity) {
            table.isReachedLimit = true
            return;
        }

        if (limited.avaliableGuest < table.maxCapacity) {
            table.avaliableGuestWithLimit = limited.avaliableGuest
            table.isAppliedLimit = true
        } else {
            table.avaliableGuestWithLimit = table.maxCapacity
        }

    })

    const result = TEST.map(r => {
        const table = tables.find(t => (t.id == r.table?.id && r.meal_hours?.hour == t.hour))
        return {
            ...r,
            table
        }
    })



    const rooms = await db.query.tblRoom.findMany({
        where: eq(tblRoom.isWaitingRoom, false)
    })

    const mealHours = await db.query.tblMealHours.findMany({
        where: eq(tblMealHours.mealId, input.mealId)
    })


    type TableStatus = {
        roomId: number,
        statues: {
            hour: string,
            limitationStatus: typeof limitationStatus[0] | undefined,
            tables: typeof result[0][]
        }[]
    }
    const tableStatues: TableStatus[] = []

    rooms.forEach(room => {
        const roomRows = result.filter(t => t.room.id == room.id)
        const statues: TableStatus['statues'] = [];
        mealHours.forEach(hour => {
            const hourRows = roomRows.filter(t => t.meal_hours?.hour == hour.hour)
            const RlimitationStatus = limitationStatus.find(l => l.room == room.id && l.hour == hour.hour)
            statues.push({
                hour: hour.hour,
                limitationStatus: RlimitationStatus,
                tables: hourRows
            })
        })
        tableStatues.push({
            roomId: room.id,
            statues
        })
    })









    result.forEach(r => {
        if (r.reservation?.hour) {
            r.reservation.hour = utcHourToLocalHour(r.reservation.hour)
        }
        if (r.meal_hours?.hour) {
            r.meal_hours.hour = utcHourToLocalHour(r.meal_hours.hour)
        }
        if (r.table?.hour) {
            r.table.hour = utcHourToLocalHour(r.table.hour)
        }
    })
    limitationStatus.forEach(r => {
        if (r.hour) {
            r.hour = utcHourToLocalHour(r.hour)
        }
    })

    mealHours.forEach(m => {
        m.hour = utcHourToLocalHour(m.hour)
    })

    tableStatues.forEach(r => {
        r.statues.forEach(s => {
            s.hour = utcHourToLocalHour(s.hour)
        })
    })

    return {
        tableStatues,
        limitationStatus,
    }
}

export const getAllAvailableReservations2 = async ({
    input,
    ctx
}: TUseCaseOwnerLayer<TReservationValidator.getTableStatues>) => {

    const { session: { user: { restaurantId } } } = ctx
    const { start, end } = getStartAndEndOfDay({
        date:
            getLocalTime((input.date))
    })

    
    const limitationStatus = await ReservationEntities.getLimitationStatuesQuery({
        date: input.date,
        mealId: input.mealId,
        restaurantId
    })

    limitationStatus.forEach(r => {
        r.avaliableGuest = r.avaliableGuest ?? r.maxGuest
        r.totalGuest = r.totalGuest ?? 0
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
                eq(tblReservation.mealId, input.mealId),
                between(tblReservation.reservationDate, start, end),
                ne(tblReservation.reservationStatusId, EnumReservationStatusNumeric.cancel)

            )
        )

    const reservationTables = getReservationTables().as('reservationTables')


    const TEST = await db
        .select({
            reservationTable: tblReservationTable,
            reservation: tblReservation,
            table: tblTable,
            room: tblRoom,
            guest: tblGuest,
            waitingSession: tblWaitingTableSession,
            reservationHolding: tblReservationHolding
        })
        .from(tblRoom)
        .leftJoin(tblTable, eq(tblTable.roomId, tblRoom.id))
        .leftJoin(reservationTables, eq(reservationTables.TABLE_ID, tblTable.id))
        .leftJoin(tblReservation, and(
            eq(tblReservation.id, reservationTables.RESERVATION_ID),
        ))
        .leftJoin(tblReservationTable, eq(tblReservationTable.id, reservationTables.RESERVATION_TABLE_ID))
        .leftJoin(tblReservationHolding, and(
            eq(tblReservationHolding.holdedReservationTableId, tblTable.id),
            between(tblReservationHolding.holdingDate, start, end)
        ))
        .leftJoin(tblGuest, eq(tblGuest.id, tblReservation.guestId))
        .leftJoin(tblWaitingTableSession, and(isNotNull(tblReservation.id), eq(tblWaitingTableSession.reservationId, tblReservation.id)))
        .where(and(
            eq(tblRoom.restaurantId, restaurantId),
            isNotNull(tblTable.id),
            ne(tblRoom.isWaitingRoom, true)
        ))


    const groupedByRoom = groupByWithKeyFn<typeof TEST[0], number>(TEST, (t) => t.room.id)

    const result = Object.values(groupedByRoom).map((roomRows) => {
        return {
            roomId: roomRows?.[0]?.room.id!,
            tables: roomRows
        }


    })

    limitationStatus.forEach(r => {
        if (r.hour) {
            r.hour = utcHourToLocalHour(r.hour)
        }
    })

    result.forEach(r => {
        r.tables.forEach(t => {
            if (t.reservation?.hour) {
                t.reservation.hour = utcHourToLocalHour(t.reservation.hour)
            }
        })
    })

    return result













}

export const getReservations = async ({
    ctx,
    input
}: TUseCaseOwnerLayer<TReservationValidator.getReservations>) => {


    const { session: { user: { restaurantId } } } = ctx

    const date = new Date(input.date)
    const { start, end } = getStartAndEndOfDay({
        date:
            getLocalTime(date)
    })
    console.log(input.date, 'input.date')
    console.log(start, end, 'start end getReservations')
    const whereConditions = [];


    if (input.status) {
        whereConditions.push(
            eq(tblReservation.reservationStatusId,
                EnumReservationStatusNumeric[input.status]
            )
        )
    }
    if (input.existenceStatus) {
        whereConditions.push(
            eq(tblReservation.reservationExistenceStatusId,
                EnumReservationExistanceStatusNumeric[input.existenceStatus]
            )
        )
    }



    const sessionLangId = ctx.userPrefrences.language.id;
    const reservations = await db.query.tblReservation.findMany({
        with: {
            tables: {
                with: {
                    table: true,
                },
            },
            room: {
                with: {
                    translations: {
                        where: eq(tblRoomTranslation.languageId, sessionLangId)
                    }
                }
            },
            guest: true,
            waitingSession: {
                with: {
                    tables: {
                        with: {
                            table: true
                        }
                    }
                },
            },
            reservationStatus: true,

            reservationExistenceStatus: true,
            reservationNotes: true,
        },
        where: and(
            eq(tblReservation.restaurantId, restaurantId),
            between(tblReservation.reservationDate, start, end),
            ...whereConditions,
        ),
        orderBy: [asc(tblReservation.id)]
    })

    reservations.forEach(r => {
        r.hour = utcHourToLocalHour(r.hour)
    })




    return reservations

}













