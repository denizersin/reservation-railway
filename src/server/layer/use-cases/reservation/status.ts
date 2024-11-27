import { db } from "@/server/db";
import { tblPrepayment, TReservationInsert } from "@/server/db/schema";
import { TUseCaseOwnerLayer } from "@/server/types/types";
import { EnumPrepaymentStatus, EnumReservationPrepaymentNumeric, EnumReservationStatus, EnumReservationStatusNumeric } from "@/shared/enums/predefined-enums";
import TReservationValidator from "@/shared/validators/reservation";
import { TRPCError } from "@trpc/server";
import { ReservationEntities } from "../../entities/reservation";
import { ReservationLogEntities } from "../../entities/reservation/reservation-log";
import { restaurantSettingEntities } from "../../entities/restaurant-setting";
import { userEntities } from "../../entities/user";
import { notificationUseCases } from "./notification";

export const requestForPrepayment = async ({
    input,
    ctx
}: TUseCaseOwnerLayer<TReservationValidator.requestForPrepayment>) => {

    const { reservationId,
        data: { customPrepaymentAmount },
        notificationOptions: { withEmail, withSms }
    } = input

    const reservation = await ReservationEntities.getReservationById({ reservationId })
    //--------------------------------
    //check if prepayment already requested and is pending
    const hasCurrentPrepayment = reservation.currentPrepaymentId

    if (hasCurrentPrepayment) {
        const currentPrepayment = await ReservationEntities.getCurrentPrepaymentById({ id: reservation.currentPrepaymentId! })
        if (currentPrepayment?.status === EnumPrepaymentStatus.pending) {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Prepayment already requested',
            })
        }
    }
    //--------------------------------



    //check if reservation has a confirmation request
    if (reservation.reservationStatusId === EnumReservationStatusNumeric.confirmation) {
        throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Reservation Has a confirmation request please cancel it first',
        })
    }
    //--------------------------------

    const restaurantId = reservation.restaurantId
    const restaurantSettings = await restaurantSettingEntities.getGeneralSettingsByRestaurantId({ restaurantId })

    const owner = await userEntities.getUserById({ userId: ctx.session.user.userId })


    const amount = customPrepaymentAmount ?? restaurantSettings.prePayemntPricePerGuest * reservation.guestCount
    const isDefaultAmount = customPrepaymentAmount ? true : false

    const [result] = await db.insert(tblPrepayment).values({
        reservationId,
        amount,
        status: EnumPrepaymentStatus.pending,
        createdBy: owner.name,
        isDefaultAmount,
    }).$returningId()

    const newPrepaymentId = result?.id

    if (!newPrepaymentId) throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Failed to create prepayment',
    })

    await ReservationEntities.updateReservation({
        reservationId,
        data: {
            currentPrepaymentId: newPrepaymentId,
            reservationStatusId: EnumReservationStatusNumeric.prepayment,
            prePaymentTypeId: EnumReservationPrepaymentNumeric.prepayment,
        },
    })

    await ReservationLogEntities.createLog({
        message: 'Asked for prepayment',
        reservationId,
        owner: owner.name
    })

    await notificationUseCases.handlePrePayment({
        reservationId,
        withEmail,
        withSms,
        ctx
    })


}

export const cancelPrepayment = async ({
    input,
    ctx
}: TUseCaseOwnerLayer<TReservationValidator.cancelPrepayment>) => {
    const { reservationId,
        notificationOptions: { withEmail, withSms }
    } = input

    const reservation = await ReservationEntities.getReservationById({ reservationId })
    if (!reservation.currentPrepaymentId) throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Reservation has no active prepayment',
    })

    const currentPrepayment = await ReservationEntities.getCurrentPrepaymentById({ id: reservation.currentPrepaymentId })

    if (!currentPrepayment) throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Reservation has no active prepayment',
    })

    if (currentPrepayment.status === EnumPrepaymentStatus.success) throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Prepayment already paid',
    })

    await db.transaction(async (trx) => {
        await ReservationEntities.updateReservationPrepayment({
            data: {
                id: currentPrepayment.id,
                status: EnumPrepaymentStatus.cancelled,
            },
            trx
        })
        await ReservationEntities.updateReservation({
            reservationId,
            data: {
                reservationStatusId: EnumReservationStatusNumeric[EnumReservationStatus.reservation],
                currentPrepaymentId: null,
                prePaymentTypeId: EnumReservationPrepaymentNumeric.none,
            },
            trx
        })
    })

    await notificationUseCases.handlePrepaymentCancelled({
        reservationId,
        withEmail,
        withSms,
        ctx
    })

}

export const requestForConfirmation = async ({
    input,
    ctx
}: TUseCaseOwnerLayer<TReservationValidator.requestForConfirmation>) => {
    const { reservationId,
        notificationOptions: { withEmail, withSms }
    } = input

    const reservation = await ReservationEntities.getReservationById({ reservationId })

    const owner = await userEntities.getUserById({ userId: ctx.session.user.userId })

    await db.transaction(async (trx) => {
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
        await notificationUseCases.handleConfirmationRequest({
            reservationId,
            withEmail,
            withSms,
            ctx
        })
        await ReservationLogEntities.createLog({
            message: 'Asked for confirmation',
            reservationId,
            owner: ctx.session.user.userId.toString()
        })

    })




}

export const cancelConfirmationRequest = async ({
    input,
    ctx
}: TUseCaseOwnerLayer<TReservationValidator.cancelConfirmationRequest>) => {
    const { reservationId } = input

    const reservation = await ReservationEntities.getReservationById({ reservationId })

    if (reservation.reservationStatusId !== EnumReservationStatusNumeric.confirmation)
        throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Reservation is not waiting for confirmation',
        })

    await db.transaction(async (trx) => {
        await ReservationEntities.deleteReservationConfirmationRequests({ reservationId, trx })
        await ReservationEntities.updateReservation({
            reservationId,
            data: {
                reservationStatusId: EnumReservationStatusNumeric.reservation,
            },
            trx
        })
    })


}

export const confirmReservation = async ({
    input,
    ctx
}: TUseCaseOwnerLayer<TReservationValidator.confirmReservation>) => {
    const { reservationId,
        notificationOptions: { withEmail, withSms }
    } = input

    const reservation = await ReservationEntities.getReservationById({ reservationId })
    const owner = await userEntities.getUserById({ userId: ctx.session.user.userId })


    await db.transaction(async (trx) => {
        await ReservationEntities.updateReservation({
            reservationId,
            data: {
                reservationStatusId: EnumReservationStatusNumeric.confirmed,
                confirmedBy: owner.name,
                confirmedAt: new Date(),
            },
            trx
        })
    })

    await notificationUseCases.handleReservationConfirmed({
        reservationId,
        withEmail,
        withSms,
        ctx,
    })

    await ReservationLogEntities.createLog({
        message: 'Reservation confirmed',
        reservationId,
        owner: owner.name
    })


}



export const notifyPrepayment = async ({
    input,
    ctx
}: TUseCaseOwnerLayer<TReservationValidator.notifyPrepayment>) => {
    const { reservationId,
        notificationOptions: { withEmail, withSms }
    } = input

    const reservation = await ReservationEntities.getReservationById({ reservationId })

    await notificationUseCases.handleNotifyPrepayment({
        reservationId,
        withEmail,
        withSms,
        ctx
    })

}
export const cancelReservation = async ({
    input,
    ctx
}: TUseCaseOwnerLayer<TReservationValidator.cancelReservation>) => {
    const { reservationId,
        notificationOptions: { withEmail, withSms }
    } = input

    const owner = await userEntities.getUserById({ userId: ctx.session.user.userId })
    const reservation = await ReservationEntities.getReservationById({ reservationId })

    const currentPrepayment = reservation.currentPrepaymentId ?
        await ReservationEntities.getCurrentPrepaymentById({ id: reservation.currentPrepaymentId }) : undefined


    const isStatusPrepayment = currentPrepayment && reservation.reservationStatusId === EnumReservationStatusNumeric.prepayment
    const isPrepaymentPaid = isStatusPrepayment && currentPrepayment.status === EnumPrepaymentStatus.success
    const isPrepaymentNotPaid = isStatusPrepayment && currentPrepayment.status !== EnumPrepaymentStatus.success

    const isStatusConfirmation = reservation.reservationStatusId === EnumReservationStatusNumeric.confirmation


    await db.transaction(async (trx) => {

        if (isPrepaymentPaid) {
            //!TODO: check if this is needed
            // await ReservationEntities.deletePrepayment({ reservationId, trx })
        }

        if (isPrepaymentNotPaid) {
            // await ReservationEntities.deletePrepayment({ reservationId, trx })
            // await 
            await ReservationEntities.updateReservation({
                reservationId,
                data: {
                    currentPrepaymentId: null,
                    reservationStatusId: EnumReservationStatusNumeric.cancel,
                    canceledBy: owner.name,
                    canceledAt: new Date(),
                },
                trx
            })
            await ReservationEntities.updateReservationPrepayment({
                data: {
                    id: currentPrepayment.id,
                    status: EnumPrepaymentStatus.cancelled,
                },
                trx
            })

        }

        if (isStatusConfirmation) {
            await ReservationEntities.deleteReservationConfirmationRequests({ reservationId, trx })
        }

        await ReservationEntities.updateReservation({
            reservationId,
            data: {
                reservationStatusId: EnumReservationStatusNumeric.cancel,
            },
            trx
        })

    })

    await ReservationLogEntities.createLog({
        message: 'Reservation canceled',
        reservationId,
        owner: owner.name
    })

    await notificationUseCases.handleReservationCancelled({
        reservationId,
        withEmail,
        withSms,
        ctx
    })
}

export const turnCanceledToReservation = async ({
    input,
    ctx
}: TUseCaseOwnerLayer<TReservationValidator.turnCanceledToReservation>) => {
    const { reservationId } = input
    const reservation = await ReservationEntities.getReservationById({ reservationId })

}

export const returnPrepayment = async ({
    input,
    ctx
}: TUseCaseOwnerLayer<TReservationValidator.returnPrepayment>) => {
    const { reservationId,
        notificationOptions: { withEmail, withSms }
    } = input
}

