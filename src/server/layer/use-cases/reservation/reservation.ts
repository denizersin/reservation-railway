import { db } from "@/server/db";
import { tblReservationLog, tblReservationNote, tblReservationNotification, tblReservationTag } from "@/server/db/schema";
import { tblReservation } from "@/server/db/schema/reservation";
import { TUseCaseOwnerLayer, TUseCasePublicLayer } from "@/server/types/types";
import {  TTransaction } from "@/server/utils/db-utils";
import { getLocalTime, getStartAndEndOfDay, localHourToUtcHour, utcHourToLocalHour } from "@/server/utils/server-utils";
import { EnumReservationExistanceStatus, EnumReservationExistanceStatusNumeric, EnumReservationPrepaymentNumeric, EnumReservationStatusNumeric } from "@/shared/enums/predefined-enums";
import TReservationValidator from "@/shared/validators/reservation";
import { format } from 'date-fns';
import { asc, between, eq } from "drizzle-orm";
import { ReservationEntities } from "../../entities/reservation";
import { ReservationLogEntities } from "../../entities/reservation/reservation-log";
import { restaurantEntities } from "../../entities/restaurant";
import { RoomEntities } from "../../entities/room";
import { userEntities } from "../../entities/user";
import { notificationUseCases } from "./notification";




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
    
    
    const restaurantSettings = await restaurantEntities.getRestaurantSettings({restaurantId})

    const hasPrepayment = reservationData.prepaymentTypeId === EnumReservationPrepaymentNumeric.prepayment
    const prePaymentAmount = data.customPrepaymentAmount ?? restaurantSettings.prePayemntPricePerGuest * reservationData.guestCount
    const isDefaultAmount = data.customPrepaymentAmount ? false : true

    const reservation = await db.transaction(async (trx) => {

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
            isCreatedByOwner: true,
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
                    currentPrepaymentId: newPrepaymentId,
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



    await notificationUseCases.handleReservationCreated({
        reservationId: reservation.id,
        withEmail: reservation.isSendEmail,
        withSms: reservation.isSendSms,
        ctx
    })

    await ReservationLogEntities.createLog({
        message: `Reservation created notification sent`,
        reservationId: reservation.id,
        owner: owner.name,
    })

    //notifications
    if (hasPrepayment) {
        await notificationUseCases.handlePrePayment({
            reservationId: reservation.id,
            withEmail: reservation.isSendEmail,
            withSms: reservation.isSendSms,
            ctx
        })
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

    await db.transaction(async (trx) => {
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

    await db.transaction(async (trx) => {
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

    const {
        reservationId,
        data,
        notificationOptions: { withEmail, withSms }
    } = input

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
    const isTimeChanged = reservation.hour !== hour
    const isGuestCountChanged = reservation.guestCount !== data.guestCount

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



    if (isTimeChanged || isDateChanged) {
        await notificationUseCases.handleReservationTimeChange({
            reservationId,
            oldValue: reservation.reservationDate.toLocaleString() + ' ' + reservation.hour,
            newValue: data.reservationDate.toLocaleString() + ' ' + data.hour,
            withEmail,
            withSms,
            ctx
        })
    }

    if (isGuestCountChanged) {
        await notificationUseCases.handleReservationGuestCountChange({
            reservationId,
            oldValue: reservation.guestCount.toString(),
            newValue: data.guestCount.toString(),
            withEmail,
            withSms,
            ctx
        })
    }

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
