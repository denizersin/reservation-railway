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
import { and, between, eq, exists, isNull, ne, not, sql, sum } from "drizzle-orm";
import { restaurantEntities } from "../../entities/restaurant";
import { tblReservationHolding, TTable } from "@/server/db/schema";
import { union } from "drizzle-orm/mysql-core";








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

    // ... existing code ...

    // GMT+3'e göre bugünün tarihini al
    const todayLocal = getLocalTime(new Date());
    todayLocal.setHours(0, 0, 0, 0);

    // GMT+3'e göre bugünün ayını al
    const currentMonth = todayLocal.getMonth();

    // Seçilen ayın ilk gününü GMT+3'e göre ayarla
    const firstDate = getLocalTime(monthDate);
    firstDate.setDate(1);
    firstDate.setHours(0, 0, 0, 0);

    // Seçilen ayın son gününü GMT+3'e göre ayarla
    const endOfMonthDay = new Date(firstDate.getFullYear(), firstDate.getMonth() + 1, 0);
    const endOfMonthDayLocal = getLocalTime(endOfMonthDay);
    endOfMonthDayLocal.setHours(23, 59, 59, 999);

    // Restoran günlerini al (zaten GMT+3'e göre)
    const daysData = await restaurantEntities.getRestaurantMealDaysByMealId({
        restaurantId: restaurantId,
        mealId: input.mealId
    });

    const inActiveMealDays = daysData
        .filter((r) => !r.isOpen)
        .map((r) => EnumDaysNumeric[r.day] as number);

    // Ayın günlerini GMT+3'e göre filtrele
    let monthDays = getMonthDays(firstDate, endOfMonthDayLocal)
        .filter((day) => !inActiveMealDays.includes(getLocalTime(day).getDay()));

    // Eğer seçilen ay bu aysa, bugünden önceki günleri filtrele
    if (firstDate.getMonth() === currentMonth && firstDate.getFullYear() === todayLocal.getFullYear()) {
        monthDays = monthDays.filter(day => getLocalTime(day) >= todayLocal);
    }

    // ... existing code ...
    const sLimitation = performance.now();
    const limitationStatus = await getLimitationStatuesQuery({
        date: monthDate,
        mealId,
        restaurantId
    })
    console.log(limitationStatus, 'limitationStatus')
    const sLimitation2 = performance.now();
    console.log(`limitation took ${sLimitation2 - sLimitation}ms`)
    const total = 0;
    const sTotal = performance.now();
    const promises = monthDays.map(async (day) => {
        //without holding
        const s1 = performance.now();
        const tableStatuses = await getStatusWithLimitation({ date: day, mealId, restaurantId, guestCount })
        const s2 = performance.now();
        console.log(` took ${s2 - s1}ms`)

        // const tableStatuses = await getStatusWithLimitationWithHolding({ date: day, mealId, restaurantId, guestCount })
        return tableStatuses
    })

    const result = await Promise.all(promises)
    const sTotal2 = performance.now();
    console.log(`total took ${sTotal2 - sTotal}ms`)


    type HourStatus = Awaited<ReturnType<typeof getStatusWithLimitation>>[0]

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



export function getStatusWithLimitation({
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










function getLimitationStatuesQuery({ date, mealId, restaurantId }: { date: Date, mealId: number, restaurantId: number }) {

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
            totalTable: sql`COALESCE(count(${tblReservation.id}), 0)`.as('totalTable'),
            totalGuest: sql<number>`COALESCE(cast(${sum(tblReservation.guestCount)} as SIGNED), 0)`.as('totalGuest'),
            avaliableGuest: sql<number>`${tblReservationLimitation.maxGuestCount} - COALESCE(cast(${sum(tblReservation.guestCount)} as SIGNED), 0)`.as('availableGuest'),
            avaliableTable: sql<number>`${tblReservationLimitation.maxTableCount} - COALESCE(count(${tblReservation.id}), 0)`.as('avaliableTable'),
        })
        .from(tblReservationLimitation)
        .leftJoin(tblReservation,
            and(
                between(tblReservation.reservationDate, start, end),
                eq(tblReservationLimitation.restaurantId, tblReservation.restaurantId),

                ne(tblReservation.reservationStatusId, EnumReservationStatusNumeric.cancel),

                eq(tblReservation.roomId, tblReservationLimitation.roomId),
                eq(tblReservationLimitation.mealId, tblReservation.mealId),


                //equal
                between(tblReservation.hour, tblReservationLimitation.minHour, tblReservationLimitation.maxHour),


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


export function getStatusWithLimitation2({
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
                ne(tblReservation.reservationStatusId, EnumReservationStatusNumeric.cancel)

            )
        )

    const reservationTables = getReservationTables().as('reservationTables')

    // Uygun masaları bulan alt sorgu
    const availableTables = db
        .select({
            hour: tblMealHours.hour,
            roomId: tblRoom.id,
            tableId: tblTable.id,
            minCapacity: tblTable.minCapacity,
            maxCapacity: tblTable.maxCapacity
        })
        .from(tblMealHours)
        .innerJoin(tblRoom, and(
            eq(tblRoom.restaurantId, tblMealHours.restaurantId),
            eq(tblRoom.isActive, true),
            eq(tblRoom.isWaitingRoom, false)
        ))
        .innerJoin(tblTable, and(
            eq(tblTable.roomId, tblRoom.id),
            eq(tblTable.isActive, true),
            between(sql<number>`${guestCount}`, tblTable.minCapacity, tblTable.maxCapacity)
        ))
        .leftJoin(reservationTables, and(
            eq(reservationTables.TABLE_ID, tblTable.id)
        ))
        .where(and(
            isNull(reservationTables.RESERVATION_ID),
            between(sql<number>`${guestCount}`, tblTable.minCapacity, tblTable.maxCapacity)
        ))

        .as('availableTables')

    // Ana sorgu
    return db
        .select({
            hour: tblMealHours.hour,
            meal: tblMealHours.mealId,
            room: tblRoom.id,
            limitationId: sql<number>`MAX(${tblReservationLimitation.id})`.as('limitationId'),
            maxTable: sql<number>`COALESCE(MAX(${tblReservationLimitation.maxTableCount}), COUNT(DISTINCT ${tblTable.id}))`,
            maxGuest: sql<number>`CAST(COALESCE(MAX(${tblReservationLimitation.maxGuestCount}), SUM(${tblTable.maxCapacity})) AS SIGNED)`,
            avaliableGuest: sql<number>`
                CASE 
                    WHEN MAX(${tblReservationLimitation.id}) IS NOT NULL THEN
                        CAST(MAX(${tblReservationLimitation.maxGuestCount}) - COALESCE(SUM(${tblReservation.guestCount}), 0) AS SIGNED)
                    ELSE
                        CAST(COUNT(DISTINCT ${availableTables.tableId}) * ${guestCount} AS SIGNED)
                END`,
            avaliableTable: sql<number>`
                CASE 
                    WHEN MAX(${tblReservationLimitation.id}) IS NOT NULL THEN
                        MAX(${tblReservationLimitation.maxTableCount}) - COALESCE(COUNT(DISTINCT ${tblReservation.id}), 0)
                    ELSE
                        COUNT(DISTINCT ${availableTables.tableId})
                END`,
        })
        .from(tblMealHours)
        .innerJoin(tblRoom, and(
            eq(tblRoom.restaurantId, tblMealHours.restaurantId),
            eq(tblRoom.isActive, true),
            eq(tblRoom.isWaitingRoom, false)
        ))
        .leftJoin(availableTables, and(
            eq(availableTables.hour, tblMealHours.hour),
            eq(availableTables.roomId, tblRoom.id)
        ))
        .leftJoin(tblReservationLimitation, and(
            eq(tblReservationLimitation.restaurantId, tblMealHours.restaurantId),
            eq(tblReservationLimitation.mealId, tblMealHours.mealId),
            eq(tblReservationLimitation.hour, tblMealHours.hour),
            eq(tblReservationLimitation.roomId, tblRoom.id),
            eq(tblReservationLimitation.isActive, true)
        ))
        .leftJoin(tblReservation, and(
            eq(tblReservation.restaurantId, restaurantId),
            eq(tblReservation.mealId, mealId),
            between(tblReservation.reservationDate, start, end),
            eq(tblReservation.hour, tblMealHours.hour),
            eq(tblReservation.roomId, tblRoom.id),
            ne(tblReservation.reservationStatusId, EnumReservationStatusNumeric.cancel)
        ))
        .where(and(
            eq(tblMealHours.restaurantId, restaurantId),
            eq(tblMealHours.mealId, mealId),
            eq(tblMealHours.isOpen, true)
        ))
        .groupBy(tblMealHours.hour, tblRoom.id)
}



export const queryTableAvailabilities = async ({
    date,
    mealId,
    restaurantId,
    guestCount
}: {
    date: Date,
    mealId: number,
    restaurantId: number,
    guestCount: number
}) => {
    //478k  40-50ms
    const { start, end } = getStartAndEndOfDay({
        date: getLocalTime(date)
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
                between(tblReservation.reservationDate, start, end),
                ne(tblReservation.reservationStatusId, EnumReservationStatusNumeric.cancel),
                eq(tblReservation.mealId, mealId),

            )
        )

    const reservationTables = getReservationTables().as('reservationTables')

    const avaliableTables = await db
        .select()
        .from(tblRoom)
        .leftJoin(tblTable, eq(tblTable.roomId, tblRoom.id))
        .leftJoin(reservationTables, eq(reservationTables.TABLE_ID, tblTable.id))
        .where(and(
            isNull(reservationTables.RESERVATION_ID),
            between(sql<number>`${guestCount}`, tblTable.minCapacity, tblTable.maxCapacity),
            eq(tblRoom.restaurantId, restaurantId),
            eq(tblRoom.isActive, true),
            eq(tblRoom.isWaitingRoom, false),
        ))


    const limitationStatus = await getLimitationStatuesQuery({
        date: date,
        mealId,
        restaurantId
    }).as('limitationStatus')

    const avaliableTablesGroupByRoom = groupByWithKeyFn(avaliableTables, (r) => r.room.id)



    const result = await db.select({
        hour: tblMealHours.hour,
        room: tblRoom.id,
        limitationId: limitationStatus.limitationId,
        maxTable: limitationStatus.maxTable,
        maxGuest: limitationStatus.maxGuest,
        avaliableGuest: limitationStatus.avaliableGuest,
        avaliableTable: limitationStatus.avaliableTable,
    })
        .from(tblMealHours)
        .innerJoin(tblRoom, and(
            eq(tblRoom.restaurantId, tblMealHours.restaurantId),
            eq(tblRoom.isActive, true),
            eq(tblRoom.isWaitingRoom, false)
        ))
        .leftJoin(limitationStatus, and(
            eq(limitationStatus.hour, tblMealHours.hour),
            eq(tblRoom.id, limitationStatus.room)
        ))


    const s1 = performance.now()
    const groupByRoom = groupByWithKeyFn(result, (r) => r.room)


    const groupByRoomResult = Object.values(groupByRoom).map((rows) => {
        return rows.map((r) => {

            const avaliableTablesOfRoom = avaliableTablesGroupByRoom[r.room]
            const isRoomHasAvaliableTable = Boolean(avaliableTablesOfRoom?.length)

            const isHourHasLimitation = r.limitationId !== null

            if (!isHourHasLimitation) {
                return {
                    ...r,
                    isAvaliable: isRoomHasAvaliableTable,
                    avaliableTableIds: avaliableTablesOfRoom?.map(a => a?.table?.id) ?? []
                }
            }

            const { avaliableGuest, avaliableTable, } = r

            const isHourNotAvalibe = !isRoomHasAvaliableTable ||
                avaliableGuest <= 0 ||
                avaliableTable <= 0 ||
                avaliableGuest < guestCount

            if (isHourNotAvalibe) {
                return {
                    ...r,
                    isAvaliable: false,
                    avaliableTableIds: []
                }
            }

            return {
                ...r,
                isAvaliable: true,
                avaliableTableIds: avaliableTablesOfRoom?.map(a => ({
                    ...a.table,
                    maxCapacity: Math.min(a.table?.maxCapacity!, avaliableGuest)
                })) ?? []
            }




        })
    })


    const mapped = groupByRoomResult.map((r) => {
        return {
            room: r[0]?.room,
            hours: r,
            isRoomHasAvaliableTable: r.some(r => r.isAvaliable)
        }
    })



    return mapped












}

