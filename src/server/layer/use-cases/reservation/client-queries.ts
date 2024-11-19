import { db } from "@/server/db";
import { tblReservation, tblReservationTable } from "@/server/db/schema/reservation";
import { tblReservationLimitation } from "@/server/db/schema/resrvation_limitation";
import { tblMealHours } from "@/server/db/schema/restaurant-assets";
import { tblRoom, tblTable } from "@/server/db/schema/room";
import { TUseCasePublicLayer } from "@/server/types/types";
import { getLocalTime, getMonthDays, getStartAndEndOfDay } from "@/server/utils/server-utils";
import { EnumReservationStatusNumeric } from "@/shared/enums/predefined-enums";
import TClientQueryValidator from "@/shared/validators/front/reservation";
import { and, between, eq, ne, sql } from "drizzle-orm";
import { restaurantEntities } from "../../entities/restaurant";
import { groupByWithKeyFn } from "@/lib/utils";






export const getMonthAvailability = async ({
    input,
    ctx,
}: TUseCasePublicLayer<TClientQueryValidator.TMonthAvailabilityQuery>) => {

    const { month, mealId } = input
    const { restaurantId } = ctx

    const inputDate = new Date(new Date().getFullYear(), month, 1)
    inputDate.setHours(0, 0, 0, 0)

    const { start, end } = getStartAndEndOfDay({
        date:
            getLocalTime(inputDate)
    })

    const endOfMonthDay = new Date(start.getFullYear(), start.getMonth() + 1, 0)

    const monthDays = getMonthDays(start, endOfMonthDay)
    const promises = monthDays.map(async (day) => {
        const tableStatuses = await getStatusWithLimitation({ date: day, mealId, restaurantId })
        return tableStatuses
    })

    const s1=performance.now();
    const result = await Promise.all(promises)
    const s2 = performance.now()
    console.log(`getMonthAvailability took ${s2 - s1}ms`)   


    type HourStatus = Awaited<ReturnType<typeof getStatusWithLimitation>>[0]

    result.forEach((dayStatuses, index) => {
        dayStatuses.forEach((r) => {

            r.avaliableMinCapacity = r.avaliableMinCapacity ?? 0
            r.avaliableMaxCapacity = r.avaliableMaxCapacity ?? 0


            if (r.limitationId) {
                const { avaliableGuest, avaliableMinCapacity, avaliableMaxCapacity } = r
                r.avaliableMinCapacity = avaliableGuest >= avaliableMinCapacity ? avaliableMinCapacity : 0
                r.avaliableMaxCapacity = Math.max(avaliableGuest, avaliableMaxCapacity)

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
            roomId: number,
            hourStatus: HourStatus[]
            hasAvailableTable: boolean
        }[],
        hasAvailableTable: boolean
    }

    const newResult: TReservationQueryResult[] = []

    //map took .07ms
    result.forEach((dayStatuses, index) => {
        const day = monthDays[index]
        const grouped = groupByWithKeyFn(dayStatuses, (dayStatus) => dayStatus.room)
        const roomStatuses = Object.entries(grouped).map(([roomId, hourStatuses]) => ({
            roomId: Number(roomId),
            hourStatus: hourStatuses,
            hasAvailableTable: hourStatuses.some(a => a.avaliableMinCapacity > 0)
        }))
        newResult.push({
            date: day!,
            roomStatus: roomStatuses,
            hasAvailableTable: roomStatuses.some(a => a.hasAvailableTable)
        })
    })


    return newResult







}

export const getAvaliableHoursByDate = async ({
    input,
    ctx,
}: TUseCasePublicLayer<TClientQueryValidator.TAvaliableHoursByDateQuery>) => {
    const { date, mealId } = input
    const { restaurantId } = ctx

    const mealHours = await restaurantEntities.getMealHours({ restaurantId, mealId })

    const hours = mealHours.find(a => a.meal.id === mealId)?.mealHours





}




function getStatusWithLimitation({ date, mealId, restaurantId }: { date: Date, mealId: number, restaurantId: number }) {
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


