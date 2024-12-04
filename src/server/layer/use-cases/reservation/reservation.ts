import { db } from "@/server/db";
import { tblReservationLog, tblReservationNote, tblReservationNotification, tblReservationTag } from "@/server/db/schema";
import { tblReservation } from "@/server/db/schema/reservation";
import { TUseCaseOwnerLayer, TUseCasePublicLayer } from "@/server/types/types";
import { TTransaction } from "@/server/utils/db-utils";
import { getLocalTime, getStartAndEndOfDay, localHourToUtcHour, utcHourToLocalHour } from "@/server/utils/server-utils";
import { EnumReservationExistanceStatus, EnumReservationExistanceStatusNumeric, EnumReservationPrepaymentNumeric, EnumReservationStatusNumeric, EnumReviewStatus } from "@/shared/enums/predefined-enums";
import TReservationValidator from "@/shared/validators/reservation";
import { format } from 'date-fns';
import { and, asc, between, eq } from "drizzle-orm";
import { ReservationEntities } from "../../entities/reservation";
import { ReservationLogEntities } from "../../entities/reservation/reservation-log";
import { restaurantEntities } from "../../entities/restaurant";
import { RoomEntities } from "../../entities/room";
import { userEntities } from "../../entities/user";
import { notificationUseCases } from "./notification";
import { paymentSettingEntities, restaurantGeneralSettingEntities } from "../../entities/restaurant-setting";
import { reservationPaymentService, reservationService } from "../../service/reservation";




export const createReservation = async ({
    input,
    ctx
}: TUseCaseOwnerLayer<TReservationValidator.createReservation>) => {

    const { session: { user: { restaurantId } } } = ctx


    const { reservationData, data } = input

    const owner = await userEntities.getUserById({ userId: ctx.session.user.userId })



    //set reservation time to utc
    const hour = localHourToUtcHour(reservationData.hour)

    const restaurantPaymentSetting = await paymentSettingEntities.getRestaurantPaymentSetting({ restaurantId })
    const restaurantGeneralSetting = await restaurantGeneralSettingEntities.getGeneralSettings({ restaurantId })

    const hasPrepayment = reservationData.prepaymentTypeId === EnumReservationPrepaymentNumeric.prepayment

    const reservationStatusId = hasPrepayment ? EnumReservationStatusNumeric.prepayment : restaurantGeneralSetting.newReservationStatusId

    const isDefaultAmount = data.customPrepaymentAmount ? false : true

    const prePaymentAmount = data.customPrepaymentAmount ?? await paymentSettingEntities.calculatePrepaymentAmount({
        guestCount: reservationData.guestCount,
        prePaymentPricePerGuest: restaurantPaymentSetting.prePaymentPricePerGuest
    })


    const reservation = await db.transaction(async (trx) => {

        const newReservation = await reservationService.createReservation({
            reservationEntityData: {
                data: {
                    ...reservationData,
                    hour,
                    restaurantId,
                    reservationStatusId,
                    prePaymentTypeId: reservationData.prepaymentTypeId,
                    //!TODO: split this to two different functions
                    createdOwnerId: ctx.session.user.userId,
                    isCreatedByOwner: true,
                },
                relatedData: {
                    tableIds: data.tableIds,
                    reservationNote: data.reservationNote,
                    reservationTagIds: data.reservationTagIds,
                },
                trx
            },
            reservationCreator: owner.name
        })



        await reservationPaymentService.createPrepayment({
            prepaymentEntityData: {
                amount: prePaymentAmount,
                isDefaultAmount,
                reservationId: newReservation.id,
                createdBy: owner.name
            },
            reservation: newReservation,
            withEmail: newReservation.isSendEmail,
            withSms: newReservation.isSendSms,
            creator: owner.name,
            trx
        })

        return newReservation
    }).catch((error) => {
        throw new Error(error)
    })




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
    await reservationService.updateReservation({
        entityData: {
            data: input.data,
            reservationId: input.reservationId,
            trx
        }
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

    await reservationService.updateReservation({
        entityData: {
            reservationId,
            data: {
                reservationExistenceStatusId: EnumReservationExistanceStatusNumeric[EnumReservationExistanceStatus.notExist],
                isCheckedin: false,
                checkedinAt: null,
                enteredMainTableAt: null,
                checkedoutAt: null,
            }
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
    const languageId = ctx.userPrefrences.language.id
    const reservationDetail = await ReservationEntities.getReservationDetail({ reservationId: input.reservationId, languageId })

    reservationDetail.hour = utcHourToLocalHour(reservationDetail.hour)

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

    const reservation = await ReservationEntities.getReservationById({ reservationId })
    await reservationService.updateReservation({
        entityData: {
            reservationId,
            data: {
                reservationStatusId: EnumReservationStatusNumeric.completed,
                reservationExistenceStatusId: EnumReservationExistanceStatusNumeric[EnumReservationExistanceStatus.checkedOut],
                checkedoutAt: new Date(),
            }
        }
    })

    //!TODO: add schedule for sending review
    await ReservationEntities.updateReservationReview({
        reviewId: reservation.reviewId,
        data: {
            status: EnumReviewStatus.PENDING
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

    const reservation = await db.query.tblReservation.findFirst({
        where: eq(tblReservation.id, reservationId),
        with: {
            tables: true
        }
    })

    if (!reservation) throw new Error('Reservation not found')


    const isDateChanged = format(reservation.reservationDate, 'dd-MM-yyyy') !== format(data.reservationDate, 'dd-MM-yyyy')

    const isTimeChanged = reservation.hour !== hour
    const isGuestCountChanged = reservation.guestCount !== data.guestCount

    const tableData = await RoomEntities.getTableById({ tableId: data.tableId })

    const isRoomChanged = reservation.roomId !== tableData.roomId

    const isTableChanged = reservation.tables.find(t => t.tableId === data.tableId) === undefined

    if (isTableChanged) {
        await ReservationEntities.resetReservationTablesAndLinks({
            reservationId,
            tableId: data.tableId
        })
    }

    if (isDateChanged || isRoomChanged) {

        const table = await RoomEntities.getTableById({ tableId: data.tableId })



        await reservationService.updateReservation({
            entityData: {
                reservationId,
                data: {
                    roomId: table.roomId
                }
            }
        })

    }

    await reservationService.updateReservation({
        entityData: {
            reservationId,
            data: {
                reservationDate: data.reservationDate,
                hour,
                guestCount: data.guestCount,
            }
        }
    })



    if (isTimeChanged || isDateChanged) {
        await notificationUseCases.handleReservationTimeChange({
            reservationId,
            oldValue: reservation.reservationDate.toLocaleString() + ' ' + reservation.hour,
            newValue: data.reservationDate.toLocaleString() + ' ' + data.hour,
            withEmail,
            withSms,
        })
    }

    if (isGuestCountChanged) {
        await notificationUseCases.handleReservationGuestCountChange({
            reservationId,
            oldValue: reservation.guestCount.toString(),
            newValue: data.guestCount.toString(),
            withEmail,
            withSms,
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
        await reservationService.updateReservation({
            entityData: {
                reservationId,
                data: {
                    roomId: table.roomId
                }
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

    await reservationService.updateReservation({
        entityData: {
            reservationId,
            data: {
                assignedPersonalId
            }
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

export const syncHoldingReservations = async ({
    input,
    ctx
}: TUseCaseOwnerLayer<object>) => {
    const reservationId = ctx.restaurantId

    await db.delete(tblReservation).where(and(
        eq(tblReservation.restaurantId, reservationId),
        eq(tblReservation.reservationStatusId, EnumReservationStatusNumeric.holding)
    )
    )

}

export const updateReservationTagAndNote = async ({
    input,
    ctx
}: TUseCaseOwnerLayer<TReservationValidator.updateReservationTagAndNote>) => {
    const { reservationId, reservationTagIds, note } = input

    await reservationService.updateReservation({
        entityData: {
            reservationId,
            data: {
            tagIds: reservationTagIds,
                guestNote: note
            }
        }
    })
}

