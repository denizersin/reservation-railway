import { db } from "@/server/db";
import { tblGuest, tblPrepayment, tblReservationLog, tblReservationNote, tblReservationNotification, tblReservationTag, tblRestaurantGeneralSetting, tblRoomTranslation } from "@/server/db/schema";
import { tblReservation, tblReservationTable, tblWaitingTableSession } from "@/server/db/schema/reservation";
import { tblReservationLimitation } from "@/server/db/schema/resrvation_limitation";
import { tblMealHours } from "@/server/db/schema/restaurant-assets";
import { tblRoom, tblTable } from "@/server/db/schema/room";
import { TUseCaseOwnerLayer, TUseCasePublicLayer } from "@/server/types/types";
import { createTransaction, TTransaction } from "@/server/utils/db-utils";
import { getLocalTime, getStartAndEndOfDay, localHourToUtcHour, utcHourToLocalHour } from "@/server/utils/server-utils";
import { EnumPrepaymentStatus, EnumReservationExistanceStatus, EnumReservationExistanceStatusNumeric, EnumReservationPrepaymentNumeric, EnumReservationStatus, EnumReservationStatusNumeric } from "@/shared/enums/predefined-enums";
import TReservationValidator from "@/shared/validators/reservation";
import { and, asc, between, count, eq, isNotNull, ne, sql, sum } from "drizzle-orm";
import { ReservationEntities } from "../../entities/reservation";
import { ReservationLogEntities } from "../../entities/reservation/reservation-log";
import { restaurantSettingEntities } from "../../entities/restaurant-setting";
import { userEntities } from "../../entities/user";
import { notificationUseCases } from "./notification";
import { RoomEntities } from "../../entities/room";
import { groupBy, groupByWithKeyFn } from "@/lib/utils";
import { format } from 'date-fns';


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
            waitingSession: tblWaitingTableSession
        })
        .from(tblRoom)
        .leftJoin(tblTable, eq(tblTable.roomId, tblRoom.id))
        .leftJoin(reservationTables, eq(reservationTables.TABLE_ID, tblTable.id))
        .leftJoin(tblReservation, and(
            eq(tblReservation.id, reservationTables.RESERVATION_ID),
        ))
        .leftJoin(tblReservationTable, eq(tblReservationTable.id, reservationTables.RESERVATION_TABLE_ID))
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

export const createReservation = async ({
    input,
    ctx
}: TUseCaseOwnerLayer<TReservationValidator.createReservation>) => {

    const { session: { user: { restaurantId } } } = ctx
    const { reservationData, data } = input

    const owner = await userEntities.getUserById({ userId: ctx.session.user.userId })

    //set reservation time to utc
    const hour = localHourToUtcHour(reservationData.hour)
    reservationData.reservationDate.setUTCHours(Number(hour.split(':')[0]), Number(hour.split(':')[1]), 0)

    const restaurantSettings = await db.query.tblRestaurantGeneralSetting.findFirst({
        where: eq(tblRestaurantGeneralSetting.restaurantId, restaurantId)
    })
    if (!restaurantSettings) throw new Error('Restaurant settings not found')

    const hasPrepayment = reservationData.prepaymentTypeId === EnumReservationPrepaymentNumeric.prepayment
    const prePaymentAmount = data.customPrepaymentAmount ?? restaurantSettings.prePayemntPricePerGuest * reservationData.guestCount
    const isDefaultAmount = data.customPrepaymentAmount ? false : true

    const reservation = await createTransaction(async (trx) => {

        const newUnclaimedWaitingSessionId = await ReservationEntities.createUnClaimedReservationWaitingSession({ trx })

        const newReservation = await ReservationEntities.createReservation({
            ...reservationData,
            hour,
            restaurantId,
            waitingSessionId: newUnclaimedWaitingSessionId,
            reservationStatusId: restaurantSettings.newReservationStatusId,
            prePaymentTypeId: reservationData.prepaymentTypeId,
            tableIds: data.tableIds,

            //!TODO: split this to two different functions
            createdOwnerId: ctx.session.user.userId,
        })

        await ReservationEntities.updateUnClaimedReservationWaitingSession({
            data: {
                reservationId: newReservation.id,
            },
            waitingSessionId: newUnclaimedWaitingSessionId,
            trx,
        })

        if (data.reservationNote) {
            await ReservationEntities.createReservationNote({
                reservationId: newReservation.id,
                note: data.reservationNote,
                trx
            })
        }

        if (data.reservationTagIds.length > 0) {
            await ReservationEntities.createReservationTags({
                reservationId: newReservation.id,
                reservationTagIds: data.reservationTagIds,
                trx
            })
        }


        if (hasPrepayment) {
            const newPrepaymentId = await ReservationEntities.createReservationPrepayment({
                data: {
                    reservationId: newReservation.id,
                    amount: prePaymentAmount,
                    isDefaultAmount,
                    createdBy: owner.name
                },
                trx
            })

            await ReservationEntities.updateReservation({
                data: {
                    prepaymentId: newPrepaymentId,
                    reservationStatusId: EnumReservationStatusNumeric.prepayment,
                },
                reservationId: newReservation.id,
                trx
            })

        }

        return newReservation
    })

    await ReservationLogEntities.createLog({
        message: `Reservation created`,
        reservationId: reservation.id,
        owner: owner.name,
    })


    //notifications
    if (hasPrepayment) {
        await notificationUseCases.handlePrePayment({ reservation })

        await ReservationLogEntities.createLog({
            message: `Asked for prepayment`,
            reservationId: reservation.id,
            owner: owner.name,
        })
    }

}
//update reservation without relations and with logging 
export const updateReservation = async ({
    input,
    trx,
    owner
}: TUseCasePublicLayer<TReservationValidator.updateReservation, {
    trx?: TTransaction,
    owner?: string
}>) => {
    await ReservationEntities.updateReservation({
        data: input.data,
        reservationId: input.reservationId,
        trx
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
                reservationExistenceStatusId: EnumReservationExistanceStatusNumeric[EnumReservationExistanceStatus.waitingTable],
                isCheckedin: true,
                checkedinAt: new Date(),
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

    await ReservationLogEntities.createLog({
        message: `Reservation checked in`,
        reservationId,
        owner: ctx.session.user.userId.toString()
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
                reservationExistenceStatusId: EnumReservationExistanceStatusNumeric[EnumReservationExistanceStatus.inRestaurant],
                enteredMainTableAt: new Date(),
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

export const makeReservationNotExist = async ({
    input
}: TUseCaseOwnerLayer<TReservationValidator.makeReservationNotExist>) => {
    const { reservationId } = input

    const reservation = await ReservationEntities.getReservationById({ reservationId })

    await ReservationEntities.updateReservation({
        reservationId,
        data: {
            reservationExistenceStatusId: EnumReservationExistanceStatusNumeric[EnumReservationExistanceStatus.notExist],
            isCheckedin: false,
            checkedinAt: null,
            enteredMainTableAt: null,
            checkedoutAt: null,

        }
    })

    await ReservationEntities.updateReservationWaitingSession({
        waitingSessionId: reservation.waitingSessionId,
        data: {
            isinWaiting: false,
            enteredAt: null,
        }
    })
}

export const getReservationLogs = async ({
    input
}: TUseCaseOwnerLayer<TReservationValidator.getReservationLogs>) => {
    const logs = await db.query.tblReservationLog.findMany({
        where: eq(tblReservationLog.reservationId, input.reservationId)
    })
    return logs
}

export const getReservationNotifications = async ({
    input
}: TUseCaseOwnerLayer<TReservationValidator.getReservationNotifications>) => {
    const notifications = await db.query.tblReservationNotification.findMany({
        where: eq(tblReservationNotification.reservationId, input.reservationId)
    })
    return notifications
}

export const getReservationDetail = async ({
    input,
    ctx
}: TUseCaseOwnerLayer<TReservationValidator.getReservationDetail>) => {

    const reservationDetail = await ReservationEntities.getReservationDetail({ reservationId: input.reservationId })

    return reservationDetail
}

export const requestForPrepayment = async ({
    input,
    ctx
}: TUseCaseOwnerLayer<TReservationValidator.requestForPrepayment>) => {
    const { reservationId, data: { customPrepaymentAmount } } = input

    const reservation = await ReservationEntities.getReservationById({ reservationId })
    const restaurantId = reservation.restaurantId
    const restaurantSettings = await restaurantSettingEntities.getGeneralSettingsByRestaurantId({ restaurantId })

    const owner = await userEntities.getUserById({ userId: ctx.session.user.userId })

    const prepayment = await db.query.tblPrepayment.findFirst({
        where: (eq(tblPrepayment.reservationId, reservationId))
    })

    if (prepayment && prepayment.status === EnumPrepaymentStatus.pending) {
        throw new Error('Prepayment already requested')
    }

    const amount = customPrepaymentAmount ?? restaurantSettings.prePayemntPricePerGuest * reservation.guestCount
    const isDefaultAmount = customPrepaymentAmount ? true : false

    const [result] = await db.insert(tblPrepayment).values({
        reservationId,
        amount,
        status: EnumPrepaymentStatus.pending,
        createdBy: ctx.session.user.userId.toString(),
        isDefaultAmount,
    }).$returningId()

    const newPrepaymentId = result?.id

    if (!newPrepaymentId) throw new Error('Failed to create prepayment')

    await ReservationEntities.updateReservation({
        reservationId,
        data: {
            prepaymentId: newPrepaymentId,
            reservationStatusId: EnumReservationStatusNumeric.prepayment,
            prePaymentTypeId: EnumReservationPrepaymentNumeric.prepayment,
        },
    })

    await ReservationLogEntities.createLog({
        message: 'Asked for prepayment',
        reservationId,
        owner: owner.name
    })

    await notificationUseCases.handlePrePayment({ reservation })


}


export const cancelPrepayment = async ({
    input,
    ctx
}: TUseCaseOwnerLayer<TReservationValidator.cancelPrepayment>) => {
    const { reservationId } = input

    const reservation = await ReservationEntities.getReservationById({ reservationId })

    if (!reservation.prepaymentId) throw new Error('Reservation has no prepayment')
    const prepayment = await ReservationEntities.getPrepaymentByReservationId({ reservationId })

    if (prepayment.status === EnumPrepaymentStatus.success) throw new Error('Prepayment already paid')

    createTransaction(async (trx) => {
        await trx.delete(tblPrepayment).where(
            eq(tblPrepayment.id, prepayment.id)
        )
        await ReservationEntities.updateReservation({
            reservationId,
            data: {
                reservationStatusId: EnumReservationStatusNumeric[EnumReservationStatus.reservation],
                prepaymentId: null,
                prePaymentTypeId: EnumReservationPrepaymentNumeric.none,
            },
            trx
        })
    })

    await notificationUseCases.handleReservationCancelled({ reservation })

}


export const requestForConfirmation = async ({
    input,
    ctx
}: TUseCaseOwnerLayer<TReservationValidator.requestForConfirmation>) => {
    const { reservationId } = input

    const reservation = await ReservationEntities.getReservationById({ reservationId })

    const owner = await userEntities.getUserById({ userId: ctx.session.user.userId })

    createTransaction(async (trx) => {
        await ReservationEntities.createConfirmationRequest({
            data: {
                reservationId,
                createdBy: owner.name
            },
            trx
        })
        await ReservationEntities.updateReservation({
            reservationId,
            data: {
                reservationStatusId: EnumReservationStatusNumeric.confirmation,
            },
        })
        await notificationUseCases.handleConfirmationRequest({ reservation })
        await ReservationLogEntities.createLog({
            message: 'Asked for confirmation',
            reservationId,
            owner: ctx.session.user.userId.toString()
        })

    })




}

export const confirmReservation = async ({
    input,
    ctx
}: TUseCaseOwnerLayer<TReservationValidator.confirmReservation>) => {
    const { reservationId } = input

    const reservation = await ReservationEntities.getReservationById({ reservationId })
    const owner = await userEntities.getUserById({ userId: ctx.session.user.userId })

    await ReservationEntities.updateReservation({
        reservationId,
        data: {
            reservationStatusId: EnumReservationStatusNumeric.confirmed,
            confirmedBy: owner.name,
            confirmedAt: new Date(),
        },
    })



    await ReservationLogEntities.createLog({
        message: 'Reservation confirmed',
        reservationId,
        owner: owner.name
    })

    await notificationUseCases.handleReservationConfirmed({ reservation })

}

export const cancelReservation = async ({
    input,
    ctx
}: TUseCaseOwnerLayer<TReservationValidator.cancelReservation>) => {
    const { reservationId } = input

    const reservation = await ReservationEntities.getReservationById({ reservationId })

    await ReservationEntities.updateReservation({
        reservationId,
        data: {
            reservationStatusId: EnumReservationStatusNumeric.cancel,
        },
    })

    await ReservationLogEntities.createLog({
        message: 'Reservation canceled',
        reservationId,
        owner: ctx.session.user.userId.toString()
    })

    await notificationUseCases.handleReservationCancelled({ reservation })
}

export const notifyPrepayment = async ({
    input,
    ctx
}: TUseCaseOwnerLayer<TReservationValidator.notifyPrepayment>) => {
    const { reservationId } = input

    const reservation = await ReservationEntities.getReservationById({ reservationId })

    await notificationUseCases.handleNotifyPrepayment({ reservation })

}




export const deleteReservation = async ({
    input,
    ctx
}: TUseCaseOwnerLayer<TReservationValidator.deleteReservation>) => {
    const { reservationId } = input

    await db.delete(tblReservation).where(eq(tblReservation.id, reservationId))

}

export const repeatReservation = async ({
    input,
    ctx
}: TUseCaseOwnerLayer<TReservationValidator.repeatReservation>) => {
    const { reservationId } = input

    const reservation = await ReservationEntities.getReservationById({ reservationId })

    const reservationTags = await db.query.tblReservationTag.findMany({
        where: eq(tblReservationTag.reservationId, reservationId)
    })

    // const newReservationInput: TReservationValidator.createReservation = {
    //     data: {

    //     },
    //     reservationData: {}
    // }

}

export const returnPrepayment = async ({
    input,
    ctx
}: TUseCaseOwnerLayer<TReservationValidator.returnPrepayment>) => {
    const { reservationId } = input
}

export const checkOutAndCompleteReservation = async ({
    input,
    ctx
}: TUseCaseOwnerLayer<TReservationValidator.checkOutAndCompleteReservation>) => {
    const { reservationId } = input

    await ReservationEntities.updateReservation({
        reservationId,
        data: {
            reservationStatusId: EnumReservationStatusNumeric.completed,
            reservationExistenceStatusId: EnumReservationExistanceStatusNumeric[EnumReservationExistanceStatus.checkedOut],
            checkedoutAt: new Date(),
        }
    })
}

export const updateReservationTime = async ({
    input,
    ctx
}: TUseCaseOwnerLayer<TReservationValidator.updateReservationTime>) => {
    const { reservationId, data } = input

    const hour = localHourToUtcHour(data.hour)
    data.reservationDate.setUTCHours(Number(hour.split(':')[0]), Number(hour.split(':')[1]), 0)

    const reservation = await db.query.tblReservation.findFirst({
        where: eq(tblReservation.id, reservationId),
        with: {
            tables: true
        }
    })

    if (!reservation) throw new Error('Reservation not found')

    const reservationDate = getLocalTime(reservation.reservationDate)
    const newReservationDate = getLocalTime(data.reservationDate)
    const isDateChanged = format(reservationDate, 'dd-MM-yyyy') !== format(newReservationDate, 'dd-MM-yyyy')


    // const isDateChanged = format

    console.log(isDateChanged, 'isDateChanged')
    console.log(format(reservationDate, 'dd-MM-yyyy'), format(newReservationDate, 'dd-MM-yyyy'), 'reservationDate, newReservationDate')

    const tableData = await RoomEntities.getTableById({ tableId: data.tableId })

    const isRoomChanged = reservation.roomId !== tableData.roomId

    if (isDateChanged || isRoomChanged) {

        const table = await RoomEntities.getTableById({ tableId: data.tableId })


        await ReservationEntities.resetReservationTablesAndLinks({
            reservationId,
            tableId: data.tableId
        })

        await ReservationEntities.updateReservation({
            reservationId,
            data: {
                roomId: table.roomId
            }
        })

    }

    await ReservationEntities.updateReservation({
        reservationId,
        data: {
            reservationDate: data.reservationDate,
            hour,
            guestCount: data.guestCount,
        },
    })



}

export const updateReservationTable = async ({
    input,
    ctx
}: TUseCaseOwnerLayer<TReservationValidator.updateReservationTable>) => {

    const { reservationId, tableId } = input
    const table = await RoomEntities.getTableById({ tableId })
    const reservation = await ReservationEntities.getReservationById({ reservationId })
    if (reservation.roomId != table.roomId) {
        await ReservationEntities.resetReservationTablesAndLinks({
            reservationId,
            tableId
        })
        await ReservationEntities.updateReservation({
            reservationId,
            data: {
                roomId: table.roomId
            }
        })
    }
    else {
        await ReservationEntities.updateReservationTable({
            data: {
                id: input.id,
                tableId,
            }
        })

    }


}


export const updateReservationAssignedPersonal = async ({
    input,
    ctx
}: TUseCaseOwnerLayer<TReservationValidator.updateReservationAssignedPersonal>) => {
    const { reservationId, assignedPersonalId } = input

    await ReservationEntities.updateReservation({
        reservationId,
        data: {
            assignedPersonalId
        }
    })
}

export const updateReservationNote = async ({
    input,
    ctx
}: TUseCaseOwnerLayer<TReservationValidator.updateReservationNote>) => {
    const { reservationId, note } = input

    const [firstNote] = await db.query.tblReservationNote.findMany({
        where: eq(tblReservationNote.reservationId, reservationId),
        orderBy: [asc(tblReservationNote.createdAt)],
        limit: 1
    })

    if (firstNote) {
        await db.update(tblReservationNote).set({
            note
        }).where(eq(tblReservationNote.id, firstNote.id))
    } else {
        await db.insert(tblReservationNote).values({
            note,
            reservationId
        })
    }

}
