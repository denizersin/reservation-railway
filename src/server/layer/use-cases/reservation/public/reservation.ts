import { tblReservation, TGuestSelect, TTable } from "@/server/db/schema";
import { ReservationLogEntities } from "@/server/layer/entities/reservation/reservation-log";
import { TUseCasePublicLayer } from "@/server/types/types";
import { getLocalTime, localHourToUtcHour } from "@/server/utils/server-utils";
import { EnumPrepaymentStatus, EnumReservationPrepaymentNumeric, EnumReservationStatusNumeric } from "@/shared/enums/predefined-enums";
import TClientFormValidator from "@/shared/validators/front/create";
import { guestEntities } from "../../../entities/guest";
import { ReservationEntities } from "../../../entities/reservation";
import { restaurantEntities } from "../../../entities/restaurant";
import { notificationUseCases } from "../notification";
import TClientReservationActionValidator from "@/shared/validators/front/reservation-actions";
import { db } from "@/server/db";
import { TRPCError } from "@trpc/server";
import { cookies } from "next/headers";
import { EnumCookieName, OCCUPIED_TABLE_TIMEOUT } from "@/server/utils/server-constants";
import { RoomEntities } from "@/server/layer/entities/room";

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


    const occupiedTableIdValue = cookies().get(EnumCookieName.OCCUPIED_TABLE_ID)?.value

    let avaliableTable: TTable | undefined = undefined

    if (occupiedTableIdValue) {

        const isTableAvaliable = await ReservationEntities.queryTableAvailability({
            restaurantId,
            date: reservationData.date,
            mealId,
            tableId: Number(occupiedTableIdValue)
        })

        if (isTableAvaliable) {
            avaliableTable = await RoomEntities.getTableById({ tableId: Number(occupiedTableIdValue) })
        }
    } else {
        avaliableTable = await ReservationEntities.getAvaliableTable({
            restaurantId,
            date: reservationData.date,
            time,
            guestCount,
            mealId
        })
    }



    if (!avaliableTable) throw new Error('No Avaliable Table')

    //create reservation

    const hour = localHourToUtcHour(time)

    reservationData.date.setUTCHours(Number(time.split(':')[0]), Number(time.split(':')[1]), 0)





    const restaurantSettings = await restaurantEntities.getRestaurantSettings({ restaurantId })

    const prePaymentAmount = restaurantSettings.prePayemntPricePerGuest * guestCount

    const reservation = await db.transaction(async (trx) => {


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
            tableIds: [avaliableTable.id],


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

export const occupyTable = async ({
    input,
    ctx
}: TUseCasePublicLayer<TClientFormValidator.TOccupyTableSchema>) => {
    const { date, time, guestCount, mealId } = input

    const { restaurantId } = ctx

    const avaliableTable = await ReservationEntities.getAvaliableTable({
        restaurantId,
        date: date,
        time,
        guestCount,
        mealId
    })
    if (!avaliableTable) throw new TRPCError({ code: 'NOT_FOUND', message: 'No Avaliable Table' })

    cookies().set(EnumCookieName.OCCUPIED_TABLE_ID, avaliableTable.id.toString())

    await RoomEntities.updateTable({
        id: avaliableTable.id,
        isOccupied: true,
        occupiedAt: new Date(),
    })

    setTimeout(async() => {
        console.log('occupied table timeout id:', avaliableTable.id)
        cookies().delete(EnumCookieName.OCCUPIED_TABLE_ID)
        await RoomEntities.updateTable({
            id: avaliableTable.id,
            isOccupied: false,
            occupiedAt: null,
        })
    }, OCCUPIED_TABLE_TIMEOUT)



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

    db.transaction(async (trx) => {

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

    db.transaction(async (trx) => {

        await ReservationEntities.updateReservationPrepayment({
            data: {
                id: result.currentPrepaymentId!,
                status: EnumPrepaymentStatus.success,
                paidAt: new Date(),
            },
            trx
        })

        await ReservationEntities.updateReservation({
            reservationId,
            data: {
                reservationStatusId: EnumReservationStatusNumeric.confirmed,
                confirmedAt: new Date(),
                confirmedBy: 'Guest',
                isCreatedByOwner: false,

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


export const confirmPublicReservation = async ({
    input,
    ctx
}: TUseCasePublicLayer<TClientReservationActionValidator.TConfirmReservation>) => {

    const { reservationId } = input

    const reservation = await ReservationEntities.getReservationById({ reservationId })

    if (reservation.reservationStatusId !== EnumReservationStatusNumeric.confirmation)
        throw new Error('Reservation not in confirmation status')

    db.transaction(async (trx) => {
        await ReservationEntities.updateReservation({
            reservationId,
            data: {
                reservationStatusId: EnumReservationStatusNumeric.confirmed,
                confirmedBy: 'Guest',
                confirmedAt: new Date(),
            },
            trx
        })
    })

    await ReservationLogEntities.createLog({
        message: 'Reservation confirmed',
        reservationId,
        owner: 'Guest'
    })

    await notificationUseCases.handleReservationConfirmed({
        reservationId,
        withEmail: true,
        withSms: true,
        ctx
    })



}