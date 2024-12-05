import { groupByWithKeyFn } from "@/lib/utils";
import { db } from "@/server/db";
import { tblGuest, tblReservationHolding, tblRestaurantTagTranslation, tblRoomTranslation } from "@/server/db/schema";
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



export const getAllAvailableReservations2 = async ({
    input,
    ctx
}: TUseCaseOwnerLayer<TReservationValidator.getTableStatues>) => {

    const { session: { user: { restaurantId } } } = ctx
    const { start, end } = getStartAndEndOfDay({
        date:
            getLocalTime((input.date))
    })
    console.log(input.date, 'input.date')
    console.log(start, end, 'start end')
    
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
            guest: {
                with: {
                    company: true,
                    country: true,
                    phoneCodeCountry: true,
                    
                }
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
            tags: {
                with:{
                    tag: {
                        with: {
                            translations: {
                                where: eq(tblRestaurantTagTranslation.languageId, sessionLangId)
                            }
                        }
                    }
                }
            },
            currentPrepayment:true,
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


    const guestReservationCount = await ReservationEntities.getGuestReservationCountOfTodayReservation({
        restaurantId,
    })

    const mapped = reservations.map(r => ({
        ...r,
        guestReservationCount: guestReservationCount?.find(g => g.guestId == r.guestId)?.reservationCount ?? 0
    }))
    



    return mapped

}
















