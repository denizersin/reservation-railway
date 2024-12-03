import { groupByWithKeyFn } from "@/lib/utils";
import { db } from "@/server/db";
import { tblReservation, tblReservationTable } from "@/server/db/schema/reservation";
import { tblReservationLimitation } from "@/server/db/schema/resrvation_limitation";
import { tblMealHours } from "@/server/db/schema/restaurant-assets";
import { tblRoom, tblTable } from "@/server/db/schema/room";
import { TUseCaseClientLayer } from "@/server/types/types";
import { excludeSecondsFromTime, getLocalTime, getMonthDays, getStartAndEndOfDay, localHourToUtcHour, utcHourToLocalHour } from "@/server/utils/server-utils";
import { EnumDaysNumeric, EnumReservationStatusNumeric } from "@/shared/enums/predefined-enums";
import TReservatoinClientValidator from "@/shared/validators/front/reservation";
import { and, between, eq, isNull, ne, sql, sum } from "drizzle-orm";
import { reservationLimitationEntities } from "../../entities/reservation-limitation";
import { restaurantEntities } from "../../entities/restaurant";
import { dailySettingEntities } from "../../entities/restaurant-setting";







export const getMonthAvailabilityByGuestCount = async ({
    input,
    ctx,
}: TUseCaseClientLayer<TReservatoinClientValidator.TMonthAvailabilityByGuestCountQuery>) => {

    const { month, mealId, guestCount, monthDate } = input
    const { restaurantId } = ctx
    const language = ctx.userPrefrences.language


    const getDailySettings = await dailySettingEntities.getDailySettings({
        date: input.monthDate,
        restaurantId
    })

    const { closedDinnerHours: closedDinnerHoursLocal, closedAreas: closedAreIds } = getDailySettings

    const closedDinnerHours = closedDinnerHoursLocal.map(h => localHourToUtcHour(h))


    const permanentLimitation = await reservationLimitationEntities.getPermanentLimitations({
        restaurantId
    })

    // const calendarSetting = await calendarSettingEntities.getCalendarSetting({
    //     restaurantId
    // })


    // closedDinnerHours //includes close hours utc
    // closedAreIds //includes closed areas ids
    // calendarSetting.maxAdvanceBookingDays //includes max advance booking days








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


    //filter closed months
    // monthDays = monthDays.filter(day => !calendarSetting.closedMonths.includes(getLocalTime(day).getMonth()))

    //apply permanent limitation


    // Eğer seçilen ay bu aysa, bugünden önceki günleri filtrele
    if (firstDate.getMonth() === currentMonth && firstDate.getFullYear() === todayLocal.getFullYear()) {
        monthDays = monthDays.filter(day => getLocalTime(day) >= todayLocal);
    }


    const promises = monthDays.map(async (day) => {
        //without holding
        const tableStatuses = await queryTableAvailabilitiesByGuestCount({ date: day, mealId, restaurantId, guestCount })

        return tableStatuses
    })

    const result = await Promise.all(promises)


    //apply closed hours and closed areas and permanent limitation
    result.forEach((r, index) => {
        const date = monthDays[index]!
        r.forEach(room => {

            const permanentLimitatios = permanentLimitation.find(p => p.roomId === room.room
                && p.startDate <= date && p.endDate > date
            )

            const isClosedByPermanentLimitation = Boolean(permanentLimitatios)


            const isClosedByClosedAreas = index === 0 && closedAreIds.includes(room.room)


            
            
            room.hours.forEach(hour => {
                const isClosedByClosedHours = index === 0 && closedDinnerHours.includes(excludeSecondsFromTime(hour.hour))
                hour.isAvaliable = hour.isAvaliable && !isClosedByClosedHours
            })

            room.isRoomHasAvaliableTable = room.hours.some(h => h.isAvaliable)

            room.isRoomHasAvaliableTable = room.isRoomHasAvaliableTable && !isClosedByClosedAreas && !isClosedByPermanentLimitation
        })
    })




    const newResult = result.map((r, index) => {
        return {
            date: monthDays[index]!,
            roomStatus: r,
            isDateHasAvaliableTable: r.some(a => a.isRoomHasAvaliableTable)
        }
    })



    newResult.forEach(r => {
        r.roomStatus.forEach(roo => {
            roo.hours.forEach(h => {
                h.hour = utcHourToLocalHour(h.hour)
            })
        })
    })




    return newResult



}


export const queryTableAvailabilitiesByGuestCount = async ({
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
    //478k  40-50ms (40 table)
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
    type TLimitationRow = typeof result[number]
    type THourAvailibilty = TLimitationRow & {
        avaliableTableIds: number[]
        isAvaliable: boolean
    }
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




        }) as THourAvailibilty[]
    })


    const mapped = groupByRoomResult.map((hours) => {
        return {
            room: hours[0]?.room!,
            hours: hours,
            isRoomHasAvaliableTable: hours.some(r => r.isAvaliable)
        }
    })



    return mapped




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







