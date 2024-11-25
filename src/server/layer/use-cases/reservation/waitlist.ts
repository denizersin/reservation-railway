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
import { reservationUseCases } from ".";
import { localHourToUtcHour, utcHourToLocalHour } from "@/server/utils/server-utils";
import { userEntities } from "../../entities/user";



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

    // await notificationUseCases.handleAddedToWaitlist({
    //     withEmail: true,
    //     withSms: true,
    //     ctx
    // })



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

    const { session: { user: { restaurantId } } } = ctx


    const { reservationData, data } = input


    //set reservation time to utc
    const hour = localHourToUtcHour(reservationData.hour)


    const restaurantSettings = await restaurantEntities.getRestaurantSettings({ restaurantId })

    const owner = await userEntities.getUserById({ userId: ctx.session.user.userId })
    const reservation = await db.transaction(async (trx) => {

        const newReservation = await ReservationEntities.createReservation({
            data: {

                ...reservationData,
                hour,
                restaurantId,
                reservationStatusId: restaurantSettings.newReservationStatusId,
                prePaymentTypeId: EnumReservationPrepaymentNumeric.prepayment,

                waitlistId: data.waitlistId,
                //!TODO: split this to two different functions
                createdOwnerId: ctx.session.user.userId,
                isCreatedByOwner: true,
            },
            tableIds: data.tableIds,
            trx
        })



        if (data.reservationTagIds.length > 0) {
            await ReservationEntities.createReservationTags({
                reservationId: newReservation.id,
                reservationTagIds: data.reservationTagIds,
                trx
            })
        }

        const amount = restaurantSettings.prePayemntPricePerGuest * reservationData.guestCount
        const newPrepaymentId = await ReservationEntities.createReservationPrepayment({
            data: {
                reservationId: newReservation.id,
                amount,
                isDefaultAmount: true,
                createdBy: "System-Waitlist"
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



        return newReservation
    })


    await ReservationLogEntities.createLog({
        message: `Reservation created`,
        reservationId: reservation.id,
        owner: owner.name,
    })



    await notificationUseCases.handleCreatedReservationFromWaitlist({
        waitlistId: data.waitlistId,
        withEmail: reservation.isSendEmail,
        withSms: reservation.isSendSms,
        ctx
    })

    await ReservationLogEntities.createLog({
        message: `Reservation created from waitlist notification sent`,
        reservationId: reservation.id,
        owner: 'System',
    })

    //notifications
    await notificationUseCases.handlePrePayment({
        reservationId: reservation.id,
        withEmail: reservation.isSendEmail,
        withSms: reservation.isSendSms,
        ctx
    })
    await ReservationLogEntities.createLog({
        message: `Asked for prepayment`,
        reservationId: reservation.id,
        owner: 'System',
    })



    await waitlistEntities.updateWaitlist({
        id: data.waitlistId,
        data: {
            status: EnumWaitlistStatus.confirmed,
            assignedReservationId: reservation.id,
        }
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


export const getWaitlists = async ({
    input,
    ctx
}: TUseCaseOwnerLayer<TWaitlistValidator.GetWaitlists>) => {

    const { date } = input
    const { restaurantId } = ctx

    const waitlists = await waitlistEntities.getWailtists({ restaurantId, date })


    return waitlists
}

export const queryWaitlistAvailability = async ({
    input,
    ctx
}: TUseCaseOwnerLayer<TWaitlistValidator.QueryWaitlistAvailability>) => {

    const { waitlistId } = input
    const { restaurantId } = ctx

    const waitlist = await waitlistEntities.getWaitlistById({ waitlistId })

    const result = await reservationUseCases.queryTableAvailabilities({
        date: waitlist.waitlistDate,
        mealId: waitlist.mealId,
        restaurantId,
        guestCount: waitlist.guestCount
    })

    const avaliableRoom = result.find(r => r.isRoomHasAvaliableTable)
    const avalliableFirstHour = avaliableRoom?.hours.find(r => r.isAvaliable)
    const hour = avalliableFirstHour?.hour
    const tableId = avalliableFirstHour?.avaliableTableIds[0] as number
    const roomId = avaliableRoom?.room
    return {
        isAvaliable: Boolean(avaliableRoom),
        hour: hour ? utcHourToLocalHour(hour) : undefined,
        tableId,
        roomId
    }
}

