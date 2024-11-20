import { tblReservation, TGuestSelect } from "@/server/db/schema";
import { ReservationLogEntities } from "@/server/layer/entities/reservation/reservation-log";
import { TUseCasePublicLayer } from "@/server/types/types";
import { createTransaction } from "@/server/utils/db-utils";
import { getLocalTime, localHourToUtcHour } from "@/server/utils/server-utils";
import { EnumPrepaymentStatus, EnumReservationPrepaymentNumeric, EnumReservationStatusNumeric } from "@/shared/enums/predefined-enums";
import TClientFormValidator from "@/shared/validators/front/create";
import { guestEntities } from "../../../entities/guest";
import { ReservationEntities } from "../../../entities/reservation";
import { restaurantEntities } from "../../../entities/restaurant";
import { notificationUseCases } from "../notification";

export const createPublicReservation = async ({
    input,
    ctx
}: TUseCasePublicLayer<TClientFormValidator.TCreateReservationSchema>) => {

    const { userInfo, reservationData } = input

    const { restaurantId } = ctx

    const { mealId, time, guestCount } = reservationData

    const { email, phone, phoneCode, name, surname } = userInfo

    const { reservationTags } = userInfo

    //--------------------------------
    //var olan guesti bul yoksa yarat.
    let guest: TGuestSelect | undefined = undefined
    guest = await guestEntities.getGuestByPhoneAndEmail({ phone, email, phoneCode })
    if (!guest) {
        const newGuestId = await guestEntities.createGuest({
            guestData: {
                email,
                phone,
                phoneCode,
                name,
                surname,
                languageId: ctx.userPrefrences.language.id,
                restaurantId,
                tagIds: []
            }
        })
        guest = await guestEntities.getGuestById({ guestId: newGuestId })
    }
    if (!guest) throw new Error('Guest not Found or Created')
    //--------------------------------




    const avaliableTable = await ReservationEntities.getAvaliableTable({
        restaurantId,
        date: reservationData.date,
        time,
        guestCount,
        mealId
    })

    if (!avaliableTable) throw new Error('No Avaliable Table')

    //create reservation

    const hour = localHourToUtcHour(time)

    reservationData.date.setUTCHours(Number(time.split(':')[0]), Number(time.split(':')[1]), 0)





    const restaurantSettings = await restaurantEntities.getRestaurantSettings({ restaurantId })

    const prePaymentAmount = restaurantSettings.prePayemntPricePerGuest * guestCount

    const reservation = await createTransaction(async (trx) => {


        const newUnclaimedWaitingSessionId = await ReservationEntities.createUnClaimedReservationWaitingSession({ trx })

        const newReservation = await ReservationEntities.createReservation({
            guestCount,
            hour,
            guestId: guest.id,
            isSendEmail: true,
            isSendSms: true,
            mealId,
            prePaymentTypeId: EnumReservationPrepaymentNumeric.prepayment,
            reservationDate: reservationData.date,
            reservationStatusId: EnumReservationStatusNumeric.reservation,
            restaurantId,
            roomId: avaliableTable.roomId,
            waitingSessionId: newUnclaimedWaitingSessionId,
            tableIds: [avaliableTable.id]

        })

        await ReservationEntities.updateUnClaimedReservationWaitingSession({
            data: {
                reservationId: newReservation.id,
            },
            waitingSessionId: newUnclaimedWaitingSessionId,
            trx,
        })

        if (userInfo.specialRequests) {
            await ReservationEntities.createReservationNote({
                reservationId: newReservation.id,
                note: userInfo.specialRequests,
                trx
            })
        }

        if (reservationTags && reservationTags.length > 0) {
            await ReservationEntities.createReservationTags({
                reservationId: newReservation.id,
                reservationTagIds: reservationTags,
                trx
            })
        }

        //--------------------------------
        //create prepayment
        const newPrepaymentId = await ReservationEntities.createReservationPrepayment({
            data: {
                reservationId: newReservation.id,
                amount: prePaymentAmount,
                isDefaultAmount: true,
                createdBy: 'System'
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

        //--------------------------------

        return newReservation

    })

    //-----------Reservation Created Log and Notification---------------------
    await ReservationLogEntities.createLog({
        message: `Reservation created`,
        reservationId: reservation.id,
        owner: 'Guest',
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
        owner: 'Guest',
    })
    //--------------------------------


    //-----------Prepayment Notification and log---------------------
    await notificationUseCases.handlePrePayment({
        reservationId: reservation.id,
        withEmail: reservation.isSendEmail,
        withSms: reservation.isSendSms,
        ctx
    })

    await ReservationLogEntities.createLog({
        message: `Asked for prepayment`,
        reservationId: reservation.id,
        owner: 'Guest',
    })
    //--------------------------------

    return reservation.id



}


export const getReservationStatusData = async ({
    input,
    ctx
}: TUseCasePublicLayer<{
    reservationId: number
}>) => {

    const { reservationId } = input
    const languageId = ctx.userPrefrences.language.id
    const result = await ReservationEntities.getReservationStatusData({ reservationId, languageId })

    return result


}


export const cancelPublicReservation = async ({
    input,
    ctx
}: TUseCasePublicLayer<{
    reservationId: number
}>) => {

    const { reservationId } = input

    const { restaurantId } = ctx

    const reservation = await ReservationEntities.getReservationById({ reservationId })

    if (reservation.restaurantId !== restaurantId) throw new Error('Reservation not found')

    const currentPrepayment = reservation.currentPrepaymentId ?
        await ReservationEntities.getCurrentPrepaymentById({ id: reservation.currentPrepaymentId }) : undefined


    const isStatusPrepayment = currentPrepayment && reservation.reservationStatusId === EnumReservationStatusNumeric.prepayment
    const isPrepaymentPaid = isStatusPrepayment && currentPrepayment.status === EnumPrepaymentStatus.success
    const isPrepaymentNotPaid = isStatusPrepayment && currentPrepayment.status !== EnumPrepaymentStatus.success

    const isStatusConfirmation = reservation.reservationStatusId === EnumReservationStatusNumeric.confirmation

    createTransaction(async (trx) => {

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
                    canceledBy: 'Guest',
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
        owner: 'Guest'
    })

    await notificationUseCases.handleReservationCancelled({
        reservationId,
        withEmail: true,
        withSms: true,
        ctx
    })


}

export const handlePrepaymentPublicReservation = async ({
    input,
    ctx
}: TUseCasePublicLayer<{
    reservationId: number
}>) => {
    //succsess callback from payment gateway


    const { reservationId } = input

    const reservation = await ReservationEntities.getReservationById({ reservationId })



}

export const handleSuccessPrepaymentPublicReservation = async ({
    reservationId
}: {
    reservationId: number
}) => {

    const result = await ReservationEntities.getReservationById({ reservationId })

    if (!result.currentPrepaymentId) {
        await ReservationLogEntities.createLog({
            message: 'Prepayment not found While Success Callback!',
            reservationId,
            owner: 'System'
        })
        throw new Error('Prepayment not found While Success Callback!')
    }

    createTransaction(async (trx) => {

        await ReservationEntities.updateReservationPrepayment({
            data: {
                id: result.currentPrepaymentId!,
                status: EnumPrepaymentStatus.success,
            },
            trx
        })

        await ReservationEntities.updateReservation({
            reservationId,
            data: {
                reservationStatusId: EnumReservationStatusNumeric.confirmed,
            },
            trx
        })


        await ReservationLogEntities.createLog({
            message: 'Prepayment success ',
            reservationId,
            owner: 'Guest'
        })

        await notificationUseCases.handleReservationConfirmed({
            reservationId,
            withEmail: true,
            withSms: true,
            
        })






    })



}