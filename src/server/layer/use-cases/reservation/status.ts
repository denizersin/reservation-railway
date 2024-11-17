import { db } from "@/server/db";
import { tblPrepayment } from "@/server/db/schema";
import { TUseCaseOwnerLayer } from "@/server/types/types";
import { createTransaction } from "@/server/utils/db-utils";
import { EnumPrepaymentStatus, EnumReservationPrepaymentNumeric, EnumReservationStatus, EnumReservationStatusNumeric } from "@/shared/enums/predefined-enums";
import TReservationValidator from "@/shared/validators/reservation";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
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

    //--------------------------------
    //check if prepayment already requested
    const prepayment = await db.query.tblPrepayment.findFirst({
        where: (eq(tblPrepayment.reservationId, reservationId))
    })
    if (prepayment && prepayment.status === EnumPrepaymentStatus.pending) {
        throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Prepayment already requested',
        })
    }
    //--------------------------------


    const reservation = await ReservationEntities.getReservationById({ reservationId })

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
        createdBy: ctx.session.user.userId.toString(),
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


    const prepayment = await ReservationEntities.getPrepaymentByReservationId({ reservationId })
    if (!prepayment) throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Reservation has no prepayment',
    })

    if (prepayment.status === EnumPrepaymentStatus.success) throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Prepayment already paid',
    })

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

    createTransaction(async (trx) => {
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

    await notificationUseCases.handleReservationConfirmed({
        reservationId,
        withEmail,
        withSms,
        ctx
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

    const prepayment = await ReservationEntities.getPrepaymentByReservationId({ reservationId })
    const reservation = await ReservationEntities.getReservationById({ reservationId })


    const isStatusPrepayment = prepayment && reservation.reservationStatusId === EnumReservationStatusNumeric.prepayment
    const isPrepaymentPaid = isStatusPrepayment && prepayment.status === EnumPrepaymentStatus.success
    const isPrepaymentNotPaid = isStatusPrepayment && prepayment.status !== EnumPrepaymentStatus.success

    const isStatusConfirmation = reservation.reservationStatusId === EnumReservationStatusNumeric.confirmation


    createTransaction(async (trx) => {

        if (isPrepaymentPaid) {
            // await ReservationEntities.deletePrepayment({ reservationId, trx })
        }

        if (isPrepaymentNotPaid) {
            await ReservationEntities.deletePrepayment({ reservationId, trx })
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
        owner: ctx.session.user.userId.toString()
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

