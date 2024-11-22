import { groupByWithKeyFn } from "@/lib/utils";
import { db } from "@/server/db";
import { tblReservation, tblReservationTable } from "@/server/db/schema/reservation";
import { tblReservationLimitation } from "@/server/db/schema/resrvation_limitation";
import { tblMealHours } from "@/server/db/schema/restaurant-assets";
import { tblRoom, tblTable } from "@/server/db/schema/room";
import { TUseCaseClientLayer, TUseCasePublicLayer } from "@/server/types/types";
import { getLocalTime, getMonthDays, getStartAndEndOfDay, utcHourToLocalHour } from "@/server/utils/server-utils";
import { EnumDaysNumeric, EnumReservationStatusNumeric } from "@/shared/enums/predefined-enums";
import TReservatoinClientValidator from "@/shared/validators/front/reservation";
import { and, between, eq, ne, sql } from "drizzle-orm";
import { restaurantEntities } from "../../entities/restaurant";
import { tblReservationHolding } from "@/server/db/schema";
import { union } from "drizzle-orm/mysql-core";






export const getMonthAvailability = async ({
    input,
    ctx,
}: TUseCaseClientLayer<TReservatoinClientValidator.TMonthAvailabilityQuery>) => {

    const { month, mealId, } = input
    const { restaurantId } = ctx
    const language = ctx.userPrefrences.language

    const today = new Date();

    const firstDate = new Date()
    firstDate.setUTCDate(today.getUTCDate())
    firstDate.setUTCHours(0, 0, 0, 0)
    firstDate.setUTCMonth(month)
    firstDate.setUTCFullYear(today.getUTCFullYear())





    const endOfMonthDay = new Date(firstDate.getFullYear(), firstDate.getMonth() + 1, 0)

    const daysData = await restaurantEntities.getRestaurantMealDaysByMealId({ restaurantId: restaurantId, mealId: input.mealId })
    const inActiveMealDays = daysData
        .filter((r) => !r.isOpen)
        .map((r) => EnumDaysNumeric[r.day] as number)



    const monthDays = getMonthDays(firstDate, endOfMonthDay)
        .filter((day) => !inActiveMealDays.includes(getLocalTime(day).getUTCDay()))





    const promises = monthDays.map(async (day) => {
        const tableStatuses = await getStatusWithLimitationBackup({ date: day, mealId, restaurantId })
        return tableStatuses
    })

    const result = await Promise.all(promises)

    type HourStatus = Awaited<ReturnType<typeof getStatusWithLimitationBackup>>[0]

    const rooms = await restaurantEntities.getRestaurantRoomsWithTranslations({ restaurantId, languageId: language.id })

    result.forEach((dayStatuses, index) => {
        dayStatuses.forEach((r) => {

            r.avaliableMinCapacity = r.avaliableMinCapacity ?? 0
            r.avaliableMaxCapacity = r.avaliableMaxCapacity ?? 0


            if (r.limitationId) {
                const { avaliableGuest, avaliableMinCapacity, avaliableMaxCapacity } = r
                r.avaliableMinCapacity = avaliableGuest >= avaliableMinCapacity ? avaliableMinCapacity : 0
                r.avaliableMaxCapacity = avaliableGuest >= avaliableMaxCapacity ? avaliableMaxCapacity : avaliableGuest

                if (r.avaliableTable < 0) {
                    r.avaliableMinCapacity = 0;
                    r.avaliableMaxCapacity = 0
                }
            }
        })
    })

    type TReservationQueryResult = {
        date: Date,
        roomStatus: {
            room: {
                id: number,
                name: string
            },
            hourStatus: HourStatus[]
            hasAvailableTable: boolean
        }[],
        hasAvailableTable: boolean,

    }

    const newResult: TReservationQueryResult[] = []

    //map took .07ms
    result.forEach((dayStatuses, index) => {
        const day = monthDays[index]
        const grouped = groupByWithKeyFn(dayStatuses, (dayStatus) => dayStatus.room)
        const roomStatuses = Object.entries(grouped).map(([roomId, hourStatuses]) => ({
            room: {
                id: Number(roomId),
                name: rooms.find(a => a.id === Number(roomId))!.translations[0]?.name!
            },
            hourStatus: hourStatuses,
            hasAvailableTable: hourStatuses.some(a => a.avaliableMinCapacity > 0)
        }))
        newResult.push({
            date: day!,
            roomStatus: roomStatuses,
            hasAvailableTable: roomStatuses.some(a => a.hasAvailableTable)
        })
    })




    newResult.forEach((r) => {
        r.roomStatus.forEach((r) => {
            r.hourStatus.forEach((r) => {
                r.hour = utcHourToLocalHour(r.hour)
            })
        })
    })





    //get permanen limitation??


    return newResult







}

export const getAvaliableHoursByDate = async ({
    input,
    ctx,
}: TUseCaseClientLayer<TReservatoinClientValidator.TAvaliableHoursByDateQuery>) => {
    const { date, mealId } = input
    const { restaurantId } = ctx

    const mealHours = await restaurantEntities.getMealHours({ restaurantId, mealId })

    const hours = mealHours.find(a => a.meal.id === mealId)?.mealHours





}


export const getMonthAvailabilityByGuestCount = async ({
    input,
    ctx,
}: TUseCaseClientLayer<TReservatoinClientValidator.TMonthAvailabilityByGuestCountQuery>) => {
    const { month, mealId, guestCount, monthDate } = input
    const { restaurantId } = ctx
    const language = ctx.userPrefrences.language

    const todayLocal = getLocalTime(new Date());
    todayLocal.setHours(0, 0, 0, 0);

    console.log(new Date().toISOString(), 'new Date().toISOString()')
    console.log(new Date().toString(), 'new Date().toString()')
    console.log(new Date().toLocaleDateString(), 'new Date().toLocaleDateString()')


    const today = new Date(todayLocal.toISOString())

    const currentMonth = today.getUTCMonth();

    const firstDate = monthDate

    const endOfMonthDay = new Date(firstDate.getFullYear(), firstDate.getMonth() + 1, 0)


    const daysData = await restaurantEntities.getRestaurantMealDaysByMealId({ restaurantId: restaurantId, mealId: input.mealId })
    const inActiveMealDays = daysData
        .filter((r) => !r.isOpen)
        .map((r) => EnumDaysNumeric[r.day] as number)

    let monthDays = getMonthDays(firstDate, endOfMonthDay)
        .filter((day) => !inActiveMealDays.includes(getLocalTime(day).getDay()))


    // If the requested month is the current month, filter days starting from today
    if (monthDate.getUTCMonth() === currentMonth && monthDate.getUTCFullYear() === today.getUTCFullYear()) {
        monthDays = monthDays.filter(day => day >= today)
    }
    console.log(monthDate, 'monthDate')
    console.log(monthDays.length, 'monthDays.length')

    const promises = monthDays.map(async (day) => {
        //without holding
        const tableStatuses = await getStatusWithLimitation({ date: day, mealId, restaurantId, guestCount })

        // const tableStatuses = await getStatusWithLimitationWithHolding({ date: day, mealId, restaurantId, guestCount })
        return tableStatuses
    })

    const result = await Promise.all(promises)

    type HourStatus = Awaited<ReturnType<typeof getStatusWithLimitationWithHolding>>[0]

    const rooms = await restaurantEntities.getRestaurantRoomsWithTranslations({ restaurantId, languageId: language.id })

    result.forEach((dayStatuses, index) => {
        dayStatuses.forEach((r) => {

            r.avaliableMinCapacity = r.avaliableMinCapacity ?? 0
            r.avaliableMaxCapacity = r.avaliableMaxCapacity ?? 0


            if (r.limitationId) {
                const { avaliableGuest, avaliableMinCapacity, avaliableMaxCapacity } = r
                r.avaliableMinCapacity = avaliableGuest >= avaliableMinCapacity ? avaliableMinCapacity : 0
                r.avaliableMaxCapacity = avaliableGuest >= avaliableMaxCapacity ? avaliableMaxCapacity : avaliableGuest

                if (r.avaliableTable <= 0) {
                    r.avaliableMinCapacity = 0;
                    r.avaliableMaxCapacity = 0

                }
            }
        })
    })

    type TReservationQueryResult = {
        date: Date,
        roomStatus: {
            room: {
                id: number,
                name: string
            },
            hourStatus: HourStatus[]
            hasAvailableTable: boolean
        }[],
        hasAvailableTable: boolean,

    }

    const newResult: TReservationQueryResult[] = []

    //map took .07ms
    result.forEach((dayStatuses, index) => {
        const day = monthDays[index]
        const grouped = groupByWithKeyFn(dayStatuses, (dayStatus) => dayStatus.room)
        const roomStatuses = Object.entries(grouped).map(([roomId, hourStatuses]) => ({
            room: {
                id: Number(roomId),
                name: rooms.find(a => a.id === Number(roomId))!.translations[0]?.name!
            },
            hourStatus: hourStatuses,
            hasAvailableTable: hourStatuses.some(a => a.avaliableMinCapacity > 0)
        }))
        newResult.push({
            date: day!,
            roomStatus: roomStatuses,
            hasAvailableTable: roomStatuses.some(a => a.hasAvailableTable)
        })
    })




    newResult.forEach((r) => {
        r.roomStatus.forEach((r) => {
            r.hourStatus.forEach((r) => {
                r.hour = utcHourToLocalHour(r.hour)
            })
        })
    })





    //get permanen limitation??


    return newResult







}



function getStatusWithLimitation({
    date,
    mealId,
    restaurantId,
    guestCount
}: {
    date: Date,
    mealId: number,
    restaurantId: number,
    guestCount: number
}) {
    const { start, end } = getStartAndEndOfDay({
        date: getLocalTime(date)
    })


    // All reserved tables for non-limited hours
    const reservedTables = db
        .select({
            tableId: tblReservationTable.tableId
        })
        .from(tblReservation)
        .leftJoin(tblReservationTable, eq(tblReservation.id, tblReservationTable.reservationId))
        .where(and(
            between(tblReservation.reservationDate, start, end),
            ne(tblReservation.reservationStatusId, EnumReservationStatusNumeric.cancel),
            eq(tblReservation.restaurantId, restaurantId),
            eq(tblReservation.mealId, mealId),
        ))
        .as('reservedTables')

    // Hourly reservations for limited hours
    const hourlyReservations = db
        .select({
            hour: tblReservation.hour,
            roomId: tblReservation.roomId,
            totalGuests: sql<number>`CAST(SUM(${tblReservation.guestCount}) AS SIGNED)`.as('totalGuests'),
            totalTables: sql<number>`COUNT(DISTINCT ${tblReservation.id})`.as('totalTables'),
        })
        .from(tblReservation)
        .where(and(
            between(tblReservation.reservationDate, start, end),
            ne(tblReservation.reservationStatusId, EnumReservationStatusNumeric.cancel),
            eq(tblReservation.restaurantId, restaurantId),
            eq(tblReservation.mealId, mealId),
        ))
        .groupBy(tblReservation.hour, tblReservation.roomId)
        .as('hourlyReservations')



    return db
        .select({
            hour: tblMealHours.hour,
            meal: tblMealHours.mealId,
            room: tblRoom.id,
            limitationId: sql<number>`MAX(${tblReservationLimitation.id})`.as('limitationId'),
            maxTable: sql<number>`
                COALESCE(
                    MAX(${tblReservationLimitation.maxTableCount}),
                    COUNT(DISTINCT ${tblTable.id})
                )
            `.as('maxTable'),
            maxGuest: sql<number>`
                CAST(COALESCE(
                    MAX(${tblReservationLimitation.maxGuestCount}),
                    SUM(${tblTable.maxCapacity})
                ) AS SIGNED)
            `.as('maxGuest'),
            avaliableGuest: sql<number>`
                CASE 
                    WHEN MAX(${tblReservationLimitation.id}) IS NOT NULL THEN
                        CASE
                            WHEN ${guestCount} <= MAX(${tblReservationLimitation.maxGuestCount}) - COALESCE(${hourlyReservations.totalGuests}, 0)
                            THEN CAST(MAX(${tblReservationLimitation.maxGuestCount}) - COALESCE(${hourlyReservations.totalGuests}, 0) AS SIGNED)
                            ELSE 0
                        END
                    ELSE
                        CAST(
                            SUM(CASE 
                                WHEN ${tblTable.id} NOT IN (SELECT ${reservedTables.tableId} FROM ${reservedTables})
                                    AND ${guestCount} BETWEEN ${tblTable.minCapacity} AND ${tblTable.maxCapacity}
                                THEN ${tblTable.maxCapacity}
                                ELSE 0
                            END)
                        AS SIGNED)
                END
            `.as('availableGuest'),
            avaliableTable: sql<number>`
                CASE 
                    WHEN MAX(${tblReservationLimitation.id}) IS NOT NULL THEN
                        CASE
                            WHEN ${guestCount} <= MAX(${tblReservationLimitation.maxGuestCount}) - COALESCE(${hourlyReservations.totalGuests}, 0)
                            THEN MAX(${tblReservationLimitation.maxTableCount}) - COALESCE(${hourlyReservations.totalTables}, 0)
                            ELSE 0
                        END
                    ELSE
                        COUNT(DISTINCT CASE 
                            WHEN ${tblTable.id} NOT IN (SELECT ${reservedTables.tableId} FROM ${reservedTables})
                                AND ${guestCount} BETWEEN ${tblTable.minCapacity} AND ${tblTable.maxCapacity}
                            THEN ${tblTable.id}
                            ELSE NULL 
                        END)
                END
            `.as('availableTable'),
            avaliableMinCapacity: sql<number>`MIN(
                CASE 
                    WHEN ${tblTable.id} NOT IN (SELECT ${reservedTables.tableId} FROM ${reservedTables})
                        AND ${guestCount} BETWEEN ${tblTable.minCapacity} AND ${tblTable.maxCapacity}
                    THEN ${tblTable.minCapacity}
                    ELSE NULL 
                END
            )`.as('availableMinCapacity'),
            avaliableMaxCapacity: sql<number>`MAX(
                CASE 
                    WHEN ${tblTable.id} NOT IN (SELECT ${reservedTables.tableId} FROM ${reservedTables})
                        AND ${guestCount} BETWEEN ${tblTable.minCapacity} AND ${tblTable.maxCapacity}
                    THEN ${tblTable.maxCapacity}
                    ELSE NULL 
                END
            )`.as('availableMaxCapacity'),
        })
        .from(tblMealHours)
        .innerJoin(tblRoom, and(
            eq(tblRoom.restaurantId, tblMealHours.restaurantId),
            eq(tblRoom.isActive, true),
            eq(tblRoom.isWaitingRoom, false)
        ))
        .leftJoin(tblTable, and(
            eq(tblTable.roomId, tblRoom.id),
            eq(tblTable.isActive, true)
        ))
        .leftJoin(tblReservationLimitation, and(
            eq(tblReservationLimitation.restaurantId, tblMealHours.restaurantId),
            eq(tblReservationLimitation.mealId, tblMealHours.mealId),
            eq(tblReservationLimitation.hour, tblMealHours.hour),
            eq(tblReservationLimitation.roomId, tblRoom.id),
            eq(tblReservationLimitation.isActive, true)
        ))
        .leftJoin(hourlyReservations, and(
            eq(hourlyReservations.hour, tblMealHours.hour),
            eq(hourlyReservations.roomId, tblRoom.id)
        ))
        .where(and(
            eq(tblMealHours.restaurantId, restaurantId),
            eq(tblMealHours.mealId, mealId),
            eq(tblMealHours.isOpen, true)
        ))
        .groupBy(tblMealHours.hour, tblRoom.id)
}



function getStatusWithLimitationWithHolding({
    date,
    mealId,
    restaurantId,
    guestCount
}: {
    date: Date,
    mealId: number,
    restaurantId: number,
    guestCount: number
}) {
    const { start, end } = getStartAndEndOfDay({
        date: getLocalTime(date)
    })


    const reservedTables = union(
        db.select({
            tableId: tblReservationTable.tableId
        })
            .from(tblReservation)
            .leftJoin(tblReservationTable, eq(tblReservation.id, tblReservationTable.reservationId))
            .where(and(
                between(tblReservation.reservationDate, start, end),
                ne(tblReservation.reservationStatusId, EnumReservationStatusNumeric.cancel),
                eq(tblReservation.restaurantId, restaurantId),
                eq(tblReservation.mealId, mealId),
            )),
        db.select({
            tableId: tblReservationHolding.holdedTableId
        })
            .from(tblReservationHolding)
            .where(and(
                between(tblReservationHolding.holdingDate, start, end),
                eq(tblReservationHolding.restaurantId, restaurantId),
                eq(tblReservationHolding.mealId, mealId),
            ))
    ).as('reservedTables')

    // Hourly reservations for limited hours
    const hourlyStats = db
        .select({
            hour: tblMealHours.hour,
            roomId: tblRoom.id,
            totalGuests: sql<number>`
                CAST(
                    COALESCE(SUM(
                        CASE 
                            WHEN ${tblReservation.id} IS NOT NULL THEN ${tblReservation.guestCount}
                            ELSE 0 
                        END
                    ), 0) +
                    COALESCE(SUM(
                        CASE 
                            WHEN ${tblReservationHolding.id} IS NOT NULL THEN ${tblReservationHolding.guestCount}
                            ELSE 0 
                        END
                    ), 0)
                AS SIGNED)
            `.as('totalGuests'),
            totalTables: sql<number>`
                COUNT(DISTINCT ${tblReservation.id}) + 
                COUNT(DISTINCT ${tblReservationHolding.id})
            `.as('totalTables'),
        })
        .from(tblMealHours)
        .innerJoin(tblRoom, and(
            eq(tblRoom.restaurantId, tblMealHours.restaurantId),
            eq(tblRoom.isActive, true)
        ))
        .leftJoin(tblReservation, and(
            eq(tblReservation.hour, tblMealHours.hour),
            eq(tblReservation.roomId, tblRoom.id),
            between(tblReservation.reservationDate, start, end),
            ne(tblReservation.reservationStatusId, EnumReservationStatusNumeric.cancel),
            eq(tblReservation.restaurantId, restaurantId),
            eq(tblReservation.mealId, mealId)
        ))
        .leftJoin(tblReservationHolding, and(
            eq(tblReservationHolding.holdingDate, tblMealHours.hour),
            eq(tblReservationHolding.roomId, tblRoom.id),
            between(tblReservationHolding.holdingDate, start, end),
            eq(tblReservationHolding.restaurantId, restaurantId),
            eq(tblReservationHolding.mealId, mealId)
        ))
        .groupBy(tblMealHours.hour, tblRoom.id)
        .as('hourlyStats')




    return db
        .select({
            hour: tblMealHours.hour,
            meal: tblMealHours.mealId,
            room: tblRoom.id,
            limitationId: sql<number>`MAX(${tblReservationLimitation.id})`.as('limitationId'),
            maxTable: sql<number>`
                COALESCE(
                    MAX(${tblReservationLimitation.maxTableCount}),
                    COUNT(DISTINCT ${tblTable.id})
                )
            `.as('maxTable'),
            maxGuest: sql<number>`
                CAST(COALESCE(
                    MAX(${tblReservationLimitation.maxGuestCount}),
                    SUM(${tblTable.maxCapacity})
                ) AS SIGNED)
            `.as('maxGuest'),
            avaliableGuest: sql<number>`
                CASE 
                    WHEN MAX(${tblReservationLimitation.id}) IS NOT NULL THEN
                        CASE
                            WHEN ${guestCount} <= MAX(${tblReservationLimitation.maxGuestCount}) - COALESCE(${hourlyStats.totalGuests}, 0)
                            THEN CAST(MAX(${tblReservationLimitation.maxGuestCount}) - COALESCE(${hourlyStats.totalGuests}, 0) AS SIGNED)
                            ELSE 0
                        END
                    ELSE
                        CAST(
                            SUM(CASE 
                                WHEN ${tblTable.id} NOT IN (SELECT ${reservedTables.tableId} FROM ${reservedTables})
                                    AND ${guestCount} BETWEEN ${tblTable.minCapacity} AND ${tblTable.maxCapacity}
                                THEN ${tblTable.maxCapacity}
                                ELSE 0
                            END)
                        AS SIGNED)
                END
            `.as('availableGuest'),
            avaliableTable: sql<number>`
                CASE 
                    WHEN MAX(${tblReservationLimitation.id}) IS NOT NULL THEN
                        CASE
                            WHEN ${guestCount} <= MAX(${tblReservationLimitation.maxGuestCount}) - COALESCE(${hourlyStats.totalGuests}, 0)
                            THEN MAX(${tblReservationLimitation.maxTableCount}) - COALESCE(${hourlyStats.totalTables}, 0)
                            ELSE 0
                        END
                    ELSE
                        COUNT(DISTINCT CASE 
                            WHEN ${tblTable.id} NOT IN (SELECT ${reservedTables.tableId} FROM ${reservedTables})
                                AND ${guestCount} BETWEEN ${tblTable.minCapacity} AND ${tblTable.maxCapacity}
                            THEN ${tblTable.id}
                            ELSE NULL 
                        END)
                END
            `.as('availableTable'),
            avaliableMinCapacity: sql<number>`MIN(
                CASE 
                    WHEN ${tblTable.id} NOT IN (SELECT ${reservedTables.tableId} FROM ${reservedTables})
                        AND ${guestCount} BETWEEN ${tblTable.minCapacity} AND ${tblTable.maxCapacity}
                    THEN ${tblTable.minCapacity}
                    ELSE NULL 
                END
            )`.as('availableMinCapacity'),
            avaliableMaxCapacity: sql<number>`MAX(
                CASE 
                    WHEN ${tblTable.id} NOT IN (SELECT ${reservedTables.tableId} FROM ${reservedTables})
                        AND ${guestCount} BETWEEN ${tblTable.minCapacity} AND ${tblTable.maxCapacity}
                    THEN ${tblTable.maxCapacity}
                    ELSE NULL 
                END
            )`.as('availableMaxCapacity'),
        })
        .from(tblMealHours)
        .innerJoin(tblRoom, and(
            eq(tblRoom.restaurantId, tblMealHours.restaurantId),
            eq(tblRoom.isActive, true),
            eq(tblRoom.isWaitingRoom, false)
        ))
        .leftJoin(tblTable, and(
            eq(tblTable.roomId, tblRoom.id),
            eq(tblTable.isActive, true)
        ))
        .leftJoin(tblReservationLimitation, and(
            eq(tblReservationLimitation.restaurantId, tblMealHours.restaurantId),
            eq(tblReservationLimitation.mealId, tblMealHours.mealId),
            eq(tblReservationLimitation.hour, tblMealHours.hour),
            eq(tblReservationLimitation.roomId, tblRoom.id),
            eq(tblReservationLimitation.isActive, true)
        ))
        .leftJoin(hourlyStats, and(
            eq(hourlyStats.hour, tblMealHours.hour),
            eq(hourlyStats.roomId, tblRoom.id)
        ))
        .where(and(
            eq(tblMealHours.restaurantId, restaurantId),
            eq(tblMealHours.mealId, mealId),
            eq(tblMealHours.isOpen, true)
        ))
        .groupBy(tblMealHours.hour, tblRoom.id)
}




function getStatusWithLimitationBackup({ date, mealId, restaurantId }: { date: Date, mealId: number, restaurantId: number }) {
    const { start, end } = getStartAndEndOfDay({
        date: getLocalTime(date)
    })


    // All reserved tables for non-limited hours
    const reservedTables = db
        .select({
            tableId: tblReservationTable.tableId
        })
        .from(tblReservation)
        .leftJoin(tblReservationTable, eq(tblReservation.id, tblReservationTable.reservationId))
        .where(and(
            between(tblReservation.reservationDate, start, end),
            ne(tblReservation.reservationStatusId, EnumReservationStatusNumeric.cancel),
            eq(tblReservation.restaurantId, restaurantId),
            eq(tblReservation.mealId, mealId),
        ))
        .as('reservedTables')

    // Hourly reservations for limited hours
    const hourlyReservations = db
        .select({
            hour: tblReservation.hour,
            roomId: tblReservation.roomId,
            totalGuests: sql<number>`CAST(SUM(${tblReservation.guestCount}) AS SIGNED)`.as('totalGuests'),
            totalTables: sql<number>`COUNT(DISTINCT ${tblReservation.id})`.as('totalTables'),
        })
        .from(tblReservation)
        .where(and(
            between(tblReservation.reservationDate, start, end),
            ne(tblReservation.reservationStatusId, EnumReservationStatusNumeric.cancel),
            eq(tblReservation.restaurantId, restaurantId),
            eq(tblReservation.mealId, mealId),
        ))
        .groupBy(tblReservation.hour, tblReservation.roomId)
        .as('hourlyReservations')

    return db
        .select({
            hour: tblMealHours.hour,
            meal: tblMealHours.mealId,
            room: tblRoom.id,
            limitationId: sql<number>`MAX(${tblReservationLimitation.id})`.as('limitationId'),
            maxTable: sql<number>`
                COALESCE(
                    MAX(${tblReservationLimitation.maxTableCount}),
                    COUNT(DISTINCT ${tblTable.id})
                )
            `.as('maxTable'),
            maxGuest: sql<number>`
                CAST(COALESCE(
                    MAX(${tblReservationLimitation.maxGuestCount}),
                    SUM(${tblTable.maxCapacity})
                ) AS SIGNED)
            `.as('maxGuest'),
            avaliableGuest: sql<number>`
                CASE 
                    WHEN MAX(${tblReservationLimitation.id}) IS NOT NULL THEN
                        CAST(
                            MAX(${tblReservationLimitation.maxGuestCount}) - 
                            COALESCE(${hourlyReservations.totalGuests}, 0)
                        AS SIGNED)
                    ELSE
                        CAST(
                            SUM(CASE 
                                WHEN ${tblTable.id} NOT IN (SELECT ${reservedTables.tableId} FROM ${reservedTables})
                                THEN ${tblTable.maxCapacity}
                                ELSE 0
                            END)
                        AS SIGNED)
                END
            `.as('availableGuest'),
            avaliableTable: sql<number>`
                CASE 
                    WHEN MAX(${tblReservationLimitation.id}) IS NOT NULL THEN
                        MAX(${tblReservationLimitation.maxTableCount}) - 
                        COALESCE(${hourlyReservations.totalTables}, 0)
                    ELSE
                        COUNT(DISTINCT CASE 
                            WHEN ${tblTable.id} NOT IN (SELECT ${reservedTables.tableId} FROM ${reservedTables})
                            THEN ${tblTable.id}
                            ELSE NULL 
                        END)
                END
            `.as('availableTable'),
            avaliableMinCapacity: sql<number>`MIN(
                CASE 
                    WHEN ${tblTable.id} NOT IN (SELECT ${reservedTables.tableId} FROM ${reservedTables})
                    THEN ${tblTable.minCapacity}
                    ELSE NULL 
                END
            )`.as('availableMinCapacity'),
            avaliableMaxCapacity: sql<number>`MAX(
                CASE 
                    WHEN ${tblTable.id} NOT IN (SELECT ${reservedTables.tableId} FROM ${reservedTables})
                    THEN ${tblTable.maxCapacity}
                    ELSE NULL 
                END
            )`.as('availableMaxCapacity'),
        })
        .from(tblMealHours)
        .innerJoin(tblRoom, and(
            eq(tblRoom.restaurantId, tblMealHours.restaurantId),
            eq(tblRoom.isActive, true),
            eq(tblRoom.isWaitingRoom, false)
        ))
        .leftJoin(tblTable, and(
            eq(tblTable.roomId, tblRoom.id),
            eq(tblTable.isActive, true)
        ))
        .leftJoin(tblReservationLimitation, and(
            eq(tblReservationLimitation.restaurantId, tblMealHours.restaurantId),
            eq(tblReservationLimitation.mealId, tblMealHours.mealId),
            eq(tblReservationLimitation.hour, tblMealHours.hour),
            eq(tblReservationLimitation.roomId, tblRoom.id),
            eq(tblReservationLimitation.isActive, true)
        ))
        .leftJoin(hourlyReservations, and(
            eq(hourlyReservations.hour, tblMealHours.hour),
            eq(hourlyReservations.roomId, tblRoom.id)
        ))
        .where(and(
            eq(tblMealHours.restaurantId, restaurantId),
            eq(tblMealHours.mealId, mealId),
            eq(tblMealHours.isOpen, true)
        ))
        .groupBy(tblMealHours.hour, tblRoom.id)
}
