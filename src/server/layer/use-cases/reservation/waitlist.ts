import { TUseCaseClientLayer, TUseCaseOwnerLayer } from "@/server/types/types";
import TWaitlistValidator from "@/shared/validators/waitlist/waitlist";
import { waitlistEntities } from "../../entities/waitlist";
import { restaurantEntities } from "../../entities/restaurant";
import { db } from "@/server/db";
import { ReservationEntities } from "../../entities/reservation";
import { EnumReservationPrepaymentNumeric, EnumReservationStatusNumeric, EnumWaitlistStatus } from "@/shared/enums/predefined-enums";
import { TRPCError } from "@trpc/server";
import { ReservationLogEntities } from "../../entities/reservation/reservation-log";
import { notificationUseCases } from "./notification";
import TclientValidator from "@/shared/validators/front/create";
import { TGuestSelect } from "@/server/db/schema";
import { guestEntities } from "../../entities/guest";



export const createWaitlist = async ({
    input,
    ctx
}: TUseCaseClientLayer<TclientValidator.TCreateWaitlistSchema>) => {
    const { restaurantId } = ctx
    const { waitlistUserInfo, guestCount, mealId, waitlistDate } = input

    const { email, phone, phoneCode, name, surname, guestNote, allergenWarning, reservationTags } = waitlistUserInfo

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


    const waitlistId = await waitlistEntities.createWaitlist({
        restaurantId,
        guestCount,
        mealId,
        waitlistDate,
        guestId: guest.id,
        reservationTagIds: reservationTags?.map(String) ?? [],
        allergenWarning: allergenWarning,
        guestNote: guestNote,
    })

    return waitlistId

}

export const cancelWaitlist = async ({
    input,
    ctx
}: TUseCaseClientLayer<{
    waitlistId: number
}>) => {
    const { waitlistId } = input
    await waitlistEntities.updateWaitlist({
        id: waitlistId,
        data: {
            status: EnumWaitlistStatus.cancelled,
        }
    })

}

export const createReservationFromWaitlist = async ({
    input,
    ctx
}: TUseCaseOwnerLayer<TWaitlistValidator.CreateReservationFromWaitlist>) => {

    const { waitlistId, tableId, hour, roomId } = input

    const { restaurantId } = ctx

    const waitlist = await waitlistEntities.getWaitlistById({ waitlistId })
    const reservationTagIds = waitlist.reservationTagIds?.map(Number) ?? []
    const allergenWarning = waitlist.allergenWarning
    const guestNote = waitlist.guestNote

    const restaurantSettings = await restaurantEntities.getRestaurantSettings({ restaurantId })

    const prePaymentAmount = restaurantSettings.prePayemntPricePerGuest * waitlist.guestCount

    await db.transaction(async (trx) => {


        const reservation = await ReservationEntities.createReservation({
            data: {
                restaurantId,
                roomId,
                guestId: waitlist.guestId,
                mealId: waitlist.mealId,
                reservationDate: waitlist.waitlistDate,
                hour,
                guestCount: waitlist.guestCount,
                reservationStatusId: EnumReservationStatusNumeric.prepayment,
                prePaymentTypeId: EnumReservationPrepaymentNumeric.prepayment,
                isSendSms: true,
                isSendEmail: true,
            },
            tableIds: [tableId],
            trx
        })

        if (guestNote) {
            await ReservationEntities.createReservationNote({
                reservationId: reservation.id,
                note: guestNote,
                trx
            })
        }

        if (reservationTagIds && reservationTagIds.length > 0) {
            await ReservationEntities.createReservationTags({
                reservationId: reservation.id,
                reservationTagIds,
                trx
            })
        }

        //--------------------------------
        //create prepayment
        const newPrepaymentId = await ReservationEntities.createReservationPrepayment({
            data: {
                reservationId: reservation.id,
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
            reservationId: reservation.id,
            trx
        })

        //--------------------------------  

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

    })
        .catch((err) => {
            console.log(err, 'Error while creating reservation from holding')
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Error while creating reservation from holding' })
        })



}


export const getWaitlistStatusData = async ({
    input,
    ctx
}: TUseCaseClientLayer<{
    waitlistId: number
}>) => {

    const { waitlistId } = input

    const waitlist = await waitlistEntities.getWaitlistById({ waitlistId })

    return waitlist

}



