import { db } from "@/server/db";
import { tblGuest, tblGusetCompany, tblReserVationStatus, tblRestaurantGeneralSetting, tblRoomTranslation } from "@/server/db/schema";
import { tblReservation, tblReservationTables, tblWaitingTableSession } from "@/server/db/schema/reservation";
import { tblReservationLimitation } from "@/server/db/schema/resrvation_limitation";
import { tblMealHours } from "@/server/db/schema/restaurant-assets";
import { tblRoom, tblTable } from "@/server/db/schema/room";
import { TUseCaseOwnerLayer } from "@/server/types/types";
import { getLocalTime, getStartAndEndOfDay, localHourToUtcHour, utcHourToLocalHour } from "@/server/utils/server-utils";
import TReservationValidator from "@/shared/validators/reservation";
import { and, between, count, eq, isNotNull, like, ne, or, sql, sum } from "drizzle-orm";
import { ReservationEntities } from "../../entities/reservation";
import { createTransaction } from "@/server/utils/db-utils";
import { EnumReservationExistanceStatus, EnumReservationExistanceStatusNumeric, EnumReservationStatusNumeric } from "@/shared/enums/predefined-enums";
import { languagesData } from "@/server/data";


function getAvaliabels({ date, mealId, restaurantId }: { date: Date, mealId: number, restaurantId: number }) {

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



export const getAllAvailableReservations = async ({
    input,
    ctx
}: TUseCaseOwnerLayer<TReservationValidator.getTableStatues>) => {

    const { session: { user: { restaurantId } } } = ctx
    const { start, end } = getStartAndEndOfDay({
        date:
            getLocalTime((new Date(input.date)))
    })

    const limitationStatus = await getAvaliabels({
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
            RESERVATION_TABLE_ID: tblReservationTables.id,
            RESERVATION_ID: tblReservationTables.reservationId,
            TABLE_ID: tblReservationTables.tableId,
        })
        .from(tblReservation)
        .leftJoin(tblReservationTables, eq(tblReservationTables.reservationId, tblReservation.id))
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
        .leftJoin(tblReservationTables, eq(tblReservationTables.id, reservationTables.RESERVATION_TABLE_ID))
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


export const createReservation = async ({
    input,
    ctx
}: TUseCaseOwnerLayer<TReservationValidator.createReservation>) => {

    const { session: { user: { restaurantId } } } = ctx

    const hour = localHourToUtcHour(input.hour)
    input.reservationDate.setUTCHours(Number(hour.split(':')[0]), Number(hour.split(':')[1]), 0)
    const restaurantSettings = await db.query.tblRestaurantGeneralSetting.findFirst({
        where: eq(tblRestaurantGeneralSetting.restaurantId, restaurantId)
    })
    if (!restaurantSettings) throw new Error('Restaurant settings not found')

    const reservation = await createTransaction(async (trx) => {
        const newUnclaimedWaitingSessionId = await ReservationEntities.createUnClaimedReservationWaitingSession({ trx })
        const reservation = await ReservationEntities.createReservation({
            ...input,
            hour,
            restaurantId,
            waitingSessionId: newUnclaimedWaitingSessionId,
            reservationStatusId: restaurantSettings.newReservationStatusId,

        })
        await ReservationEntities.updateUnClaimedReservationWaitingSession({
            trx,
            data: {
                reservationId: reservation.id,
            },
            waitingSessionId: newUnclaimedWaitingSessionId
        })
        return reservation
    })



}

export const updateReservation = async ({
    input,
    ctx
}: TUseCaseOwnerLayer<TReservationValidator.updateReservation>) => {
    if (input.data.hour) {
        input.data.hour = localHourToUtcHour(input.data.hour)
        //log the change of hour
    }

    await ReservationEntities.updateReservation({
        data: input.data,
        reservationId: input.reservationId
    })

}


export const getWaitingStatus = async ({
    date,
}: {
    date: Date
}) => {
    const { start, end } = getStartAndEndOfDay({
        date:
            getLocalTime((new Date(date)))
    })

    const result = await db.query.tblReservation.findMany({

        with: {
            waitingSession: {
                with: {
                    tables: true
                }
            },
            guest: true

        },

        where: between(tblReservation.reservationDate, start, end)
    })

    result.forEach(r => {
        r.hour = utcHourToLocalHour(r.hour)
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
    const whereConditions = [];

    const guestWhereConditions = [];
    const companyWhereConditions = [];

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

    // if (input.search) {
    //     guestWhereConditions.push(
    //         or(
    //             like(tblGuest.name, `%${input.search}%`),
    //             like(tblGuest.phone, `%${input.search}%`),
    //         )
    //     )
    //     companyWhereConditions.push(
    //         like(tblGusetCompany.companyName, `%${input.search}%`)
    //     )
    // }

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
            guest: {
                with: {
                    company: true,
                    country: true,
                    language: true,
                },
            },
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
            notes: true,
        },
        where: and(
            eq(tblReservation.restaurantId, restaurantId),
            between(tblReservation.reservationDate, start, end),
            ...whereConditions,
        )
    })

    reservations.forEach(r => {
        r.hour = utcHourToLocalHour(r.hour)
    })




    return reservations

}


export const checkInReservation = async ({
    ctx,
    input: { reservationId }
}: TUseCaseOwnerLayer<TReservationValidator.checkInReservation>) => {
    // const reservationId = ctx.session.user.restaurantId
    
    const {
        updateReservation,
        updateReservationWaitingSession,
        getReservationById

    } = ReservationEntities

    await createTransaction(async (trx) => {
        const reservation = await getReservationById({ reservationId })

        await updateReservation({
            reservationId,
            data: {
                reservationExistenceStatusId: EnumReservationExistanceStatusNumeric["waiting table"],
                isCheckedin: true,
            }
        })

        await updateReservationWaitingSession({
            data: {
                isinWaiting: true,
                enteredAt: new Date(),
            },
            waitingSessionId: reservation.waitingSessionId
        })

    })

}


export const takeReservationIn = async ({
    ctx,
    input: { reservationId }
}: TUseCaseOwnerLayer<TReservationValidator.takeReservationIn>) => {

    const {
        updateReservation,
        updateReservationWaitingSession,
        getReservationById

    } = ReservationEntities

    await createTransaction(async (trx) => {
        const reservation = await getReservationById({ reservationId })

        await updateReservation({
            reservationId,

            data: {
                reservationExistenceStatusId: EnumReservationExistanceStatusNumeric["in restaurant"],
            }
        })

        await updateReservationWaitingSession({
            data: {
                isinWaiting: false,
                exitedAt: new Date(),
            },
            waitingSessionId: reservation.waitingSessionId
        })


    })
}