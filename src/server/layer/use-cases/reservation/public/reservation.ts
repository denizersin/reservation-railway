import { db } from "@/server/db";
import { tblRoom, tblTable, TGuestSelect, TReservationSelect, TTable } from "@/server/db/schema";
import { ReservationLogEntities } from "@/server/layer/entities/reservation/reservation-log";
import { TUseCaseClientLayer } from "@/server/types/types";
import { EnumCookieName, HOLDING_RESERVATION_GUEST_ID, HOLDING_TIMEOUT, OCCUPIED_TABLE_TIMEOUT } from "@/server/utils/server-constants";
import { localHourToUtcHour } from "@/server/utils/server-utils";
import { EnumPrepaymentStatus, EnumReservationPrepaymentNumeric, EnumReservationStatusNumeric, EnumReviewStatus, EnumWaitlistStatus } from "@/shared/enums/predefined-enums";
import TclientValidator from "@/shared/validators/front/create";
import TClientReservationActionValidator from "@/shared/validators/front/reservation-actions";
import { TRPCError } from "@trpc/server";
import { and, eq, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { guestEntities } from "../../../entities/guest";
import { ReservationEntities } from "../../../entities/reservation";
import { restaurantEntities } from "../../../entities/restaurant";
import { notificationUseCases } from "../notification";
import { waitlistEntities } from "@/server/layer/entities/waitlist";
import TClientReviewValidator from "@/shared/validators/front/reivew";
import { getReservationById } from "@/server/layer/entities/reservation/waiting-session";
import { predefinedEntities } from "@/server/layer/entities/predefined";
import { reservationPaymentService, reservationService } from "@/server/layer/service/reservation";
import { paymentSettingEntities, restaurantGeneralSettingEntities } from "@/server/layer/entities/restaurant-setting";

export const createPublicReservation = async ({
    input,
    ctx
}: TUseCaseClientLayer<TclientValidator.TCreateReservationSchema>) => {

    const { userInfo, reservationData } = input

    const { restaurantId } = ctx

    const { mealId, time, guestCount, } = reservationData

    const { email, phone, phoneCodeId, name, surname } = userInfo

    const utcHour = localHourToUtcHour(time)


    const { reservationTags } = userInfo

    //--------------------------------
    //var olan guesti bul yoksa yarat.
    let guest: TGuestSelect | undefined = undefined
    guest = await guestEntities.getGuestByPhoneAndEmail({ phone, email, phoneCodeId })
    if (!guest) {
        const fullPhone = await predefinedEntities.getFullPhone({ phone, phoneCodeId })
        const newGuestId = await guestEntities.createGuest({
            guestData: {
                email,
                phone,
                phoneCodeId,
                fullPhone,
                countryId: phoneCodeId,
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

    let avaliableTable: TTable | undefined = undefined

    const holdedReservationIdValue = cookies().get(EnumCookieName.HOLDED_RESERVATION_ID)?.value
    const holdedReservationId = holdedReservationIdValue ? Number(holdedReservationIdValue) : undefined

    if (holdedReservationId) {
        const reservation = await ReservationEntities.getReservationById({ reservationId: holdedReservationId })
        if (reservation) {
            console.log('111111')
            //create reservation from holding 
            const newReservationId = await createReservationFromHolding({ input: { ...input, holdedReservation: reservation, guest: guest }, ctx })
            cookies().delete(EnumCookieName.HOLDED_RESERVATION_ID)
            return newReservationId
        }
    }


    else {

        const isHourAavailable = await ReservationEntities.queryHourAvaliability({
            date: reservationData.date,
            mealId,
            restaurantId,
            utcHour: localHourToUtcHour(time),
            guestCount,
            roomId: reservationData.roomId
        })

        if (!isHourAavailable) throw new TRPCError({ code: 'NOT_FOUND', message: 'No Avaliable Table22' })

        avaliableTable = await ReservationEntities.getAvaliableTable({
            restaurantId,
            date: reservationData.date,
            utcHour,
            guestCount,
            mealId,
            roomId: reservationData.roomId
        })
    }



    if (!avaliableTable) throw new TRPCError({ code: 'NOT_FOUND', message: 'No Avaliable Table33' })




    const restaurantPaymentSetting = await paymentSettingEntities.getRestaurantPaymentSetting({ restaurantId })

    const prePaymentAmount = restaurantPaymentSetting.prePaymentPricePerGuest * guestCount


    const reservation = await db.transaction(async (trx) => {
        const newReservation = await reservationService.createReservation({
            reservationEntityData: {
                data: {
                    guestCount,
                    hour: utcHour,
                    guestId: guest.id,
                    isSendEmail: true,
                    isSendSms: true,
                    mealId,
                    prePaymentTypeId: EnumReservationPrepaymentNumeric.prepayment,
                    reservationDate: reservationData.date,
                    reservationStatusId: EnumReservationStatusNumeric.reservation,
                    restaurantId,
                    roomId: avaliableTable.roomId,
                },
                relatedData: {
                    tableIds: [avaliableTable.id],
                    guestNote: userInfo.guestNote,
                    reservationTagIds: reservationTags,
                },
                trx
            },
            reservationCreator: guest.name
        })

        //--------------------------------
        //create prepayment
        await reservationPaymentService.createPrepayment({
            prepaymentEntityData: {
                amount: prePaymentAmount,
                isDefaultAmount: true,
                reservationId: newReservation.id,
                createdBy: 'System'
            },
            reservation: newReservation,
            withEmail: newReservation.isSendEmail,
            withSms: newReservation.isSendSms,
            creator: 'System',
            trx
        })
        //--------------------------------

        return newReservation

    })



    return reservation.id



}

export const createReservationFromHolding = async ({
    input,
    ctx
}: TUseCaseClientLayer<
    TclientValidator.TCreateReservationSchema & {
        holdedReservation: TReservationSelect,
        guest: TGuestSelect
    }
>) => {

    const { holdedReservation, guest, userInfo, reservationData } = input
    const { restaurantId } = ctx
    const { mealId, time, guestCount } = reservationData

    const { reservationTags } = userInfo
    const utcHour = localHourToUtcHour(time)


    const restaurantPaymentSetting = await paymentSettingEntities.getRestaurantPaymentSetting({ restaurantId })

    const prePaymentAmount = restaurantPaymentSetting.prePaymentPricePerGuest * guestCount

    await db.transaction(async (trx) => {

        //assume this as created reservation

        await reservationService.updateReservation({
            entityData: {
                reservationId: holdedReservation.id,
                data: {
                    guestCount,
                    hour: utcHour,
                    guestId: guest.id,
                    isSendEmail: true,
                    isSendSms: true,
                    mealId,
                    prePaymentTypeId: EnumReservationPrepaymentNumeric.prepayment,
                    reservationDate: reservationData.date,
                    reservationStatusId: EnumReservationStatusNumeric.reservation,
                    restaurantId,
                    holdExpiredAt: null,
                    holdedAt: null,
                },

                trx
            }
        })




        if (userInfo.guestNote) {
            await ReservationEntities.createReservationNote({
                reservationId: holdedReservation.id,
                note: userInfo.guestNote,
                trx
            })
        }

        if (reservationTags && reservationTags.length > 0) {
            await ReservationEntities.createReservationTags({
                reservationId: holdedReservation.id,
                reservationTagIds: reservationTags,
                trx
            })
        }

        await reservationService.handleConvertHoldingToReservation({
            reservationId: holdedReservation.id,
            reservationCreator: guest.name
        })


        //--------------------------------
        //create prepayment
        await reservationPaymentService.createPrepayment({
            prepaymentEntityData: {
                amount: prePaymentAmount,
                isDefaultAmount: true,
                reservationId: holdedReservation.id,
                createdBy: 'System'
            },
            reservation: holdedReservation,
            withEmail: holdedReservation.isSendEmail,
            withSms: holdedReservation.isSendSms,
            creator: 'System',
            trx
        })
        //--------------------------------



    })
        .catch((err) => {
            console.log(err, 'Error while creating reservation from holding')
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Error while creating reservation from holding' })
        })




    return holdedReservation.id

}


export const holdTable = async ({
    input,
    ctx
}: TUseCaseClientLayer<TclientValidator.TholdTableSchema>) => {
    const { date, time, guestCount, mealId, roomId } = input

    const { restaurantId } = ctx



    const holdedReservationId = cookies().get(EnumCookieName.HOLDED_RESERVATION_ID)?.value

    if (holdedReservationId) {
        //delete if is holding
        await ReservationEntities.deleteHoldedReservationById({ holdedReservationId: Number(holdedReservationId) })
    }

    //get avaliable table with query hour limitation
    const avaliableTable = await ReservationEntities.getAvaliableTable({
        restaurantId,
        date: date,
        utcHour: localHourToUtcHour(time),
        guestCount,
        mealId,
        roomId
    })
    if (!avaliableTable) throw new TRPCError({ code: 'NOT_FOUND', message: 'No Avaliable Table' })



    const newReservation = await db.transaction(async (trx) => {

        const newReservation = await reservationService.createHoldingReservation({
            reservationEntityData: {
                data: {
                    guestCount,
                    hour: localHourToUtcHour(time),
                    reservationDate: date,
                    reservationStatusId: EnumReservationStatusNumeric.holding,
                    guestId: HOLDING_RESERVATION_GUEST_ID,
                    isSendEmail: true,
                    isSendSms: true,
                    mealId,
                    prePaymentTypeId: EnumReservationPrepaymentNumeric.none,
                    restaurantId,
                    roomId: avaliableTable.roomId,
                    holdedAt: new Date(),
                    holdExpiredAt: new Date(Date.now() + HOLDING_TIMEOUT),
                },
                relatedData: {
                    tableIds: [avaliableTable.id],
                },
                trx
            },
            reservationCreator: "System"
        })

        cookies().set(EnumCookieName.HOLDED_RESERVATION_ID, newReservation.id.toString())

        return newReservation
    })

    //!TODO: BUNUN ICIN CRON JOB KULLANILABILIR
    setTimeout(async () => {
        //delete if is holding
        await ReservationEntities.deleteHoldedReservationById({ holdedReservationId: newReservation.id })

    }, OCCUPIED_TABLE_TIMEOUT)



}

export const unHoldHoldedTable = async ({
    input,
    ctx
}: TUseCaseClientLayer<{}>) => {

    const holdedReservationId = cookies().get(EnumCookieName.HOLDED_RESERVATION_ID)?.value
    cookies().delete(EnumCookieName.HOLDED_RESERVATION_ID)
    //delete if is holding
    await ReservationEntities.deleteHoldedReservationById({ holdedReservationId: Number(holdedReservationId) })

}





export const getReservationStatusData = async ({
    input,
    ctx
}: TUseCaseClientLayer<{
    reservationId: number
}>) => {

    const { reservationId } = input
    const languageId = ctx.userPrefrences.language.id
    const result = await ReservationEntities.getReservationStatusData({ reservationId, languageId })

    const paymentSetting = await paymentSettingEntities.getRestaurantPaymentSetting({ restaurantId: ctx.restaurantId })

    const reminedHourToReservation = Math.round((result.reservationDate.getTime() - new Date().getTime()) / (60 * 60 * 1000))
    console.log(reminedHourToReservation, paymentSetting.cancellationAllowedHours, 'reminedHourToReservation, paymentSetting.cancellationAllowedHours')

    const canCancelReservation = reminedHourToReservation > paymentSetting.cancellationAllowedHours

    return {
        ...result, canCancelReservation,
        cancellationAllowedHours: paymentSetting.cancellationAllowedHours
    }


}


export const cancelPublicReservation = async ({
    input,
    ctx
}: TUseCaseClientLayer<{
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

    await db.transaction(async (trx) => {

        if (isPrepaymentPaid) {
            //!TODO: check if this is needed
            // await ReservationEntities.deletePrepayment({ reservationId, trx })
        }

        if (isPrepaymentNotPaid) {
            // await ReservationEntities.deletePrepayment({ reservationId, trx })
            // await 
            await reservationService.updateReservation({
                entityData: {
                    reservationId,
                    data: {
                        currentPrepaymentId: null,
                        reservationStatusId: EnumReservationStatusNumeric.cancel,
                        canceledBy: 'Guest',
                        canceledAt: new Date(),
                    },
                    trx
                }
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

        await reservationService.updateReservation({
            entityData: {
                reservationId,
                data: {
                    reservationStatusId: EnumReservationStatusNumeric.cancel,
                },
                trx
            }
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
    })


}

export const handlePrepaymentPublicReservation = async ({
    input,
    ctx
}: TUseCaseClientLayer<{
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

    await db.transaction(async (trx) => {

        await ReservationEntities.updateReservationPrepayment({
            data: {
                id: result.currentPrepaymentId!,
                status: EnumPrepaymentStatus.success,
                paidAt: new Date(),
            },
            trx
        })

        await reservationService.updateReservation({
            entityData: {
                reservationId,
                data: {
                    reservationStatusId: EnumReservationStatusNumeric.confirmed,
                    confirmedAt: new Date(),
                    confirmedBy: 'Guest',
                    isCreatedByOwner: false,

                },
                trx
            }
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
}: TUseCaseClientLayer<TClientReservationActionValidator.TConfirmReservation>) => {

    const { reservationId } = input

    const reservation = await ReservationEntities.getReservationById({ reservationId })

    if (reservation.reservationStatusId !== EnumReservationStatusNumeric.confirmation)
        throw new Error('Reservation not in confirmation status')

    await db.transaction(async (trx) => {
        await reservationService.updateReservation({
            entityData: {
                reservationId,
                data: {
                    reservationStatusId: EnumReservationStatusNumeric.confirmed,
                    confirmedBy: 'Guest',
                    confirmedAt: new Date(),
                },
                trx
            }
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
    })



}

export const getGuestCountFilterValues = async ({
    input,
    ctx
}: TUseCaseClientLayer<undefined>) => {

    const { restaurantId } = ctx

    const minQuery = await db.select({
        value: sql`min(${tblTable.minCapacity})`.mapWith(tblTable.minCapacity)
    }).from(tblRoom)
        .leftJoin(tblTable, eq(tblRoom.id, tblTable.roomId))
        .where(and(
            eq(tblRoom.restaurantId, restaurantId),
            eq(tblTable.isActive, true),
            eq(tblRoom.isActive, true),
            eq(tblRoom.isWaitingRoom, false)
        ))


    const maxQuery = await db.select({
        value: sql`max(${tblTable.maxCapacity})`.mapWith(tblTable.maxCapacity)
    }).from(tblRoom)
        .leftJoin(tblTable, eq(tblRoom.id, tblTable.roomId))
        .where(and(
            eq(tblRoom.restaurantId, restaurantId),
            eq(tblTable.isActive, true),
            eq(tblRoom.isActive, true),
            eq(tblRoom.isWaitingRoom, false)
        ))

    const min = minQuery[0]?.value!
    const max = maxQuery[0]?.value!
    if (Number.isNaN(min) || Number.isNaN(max)) throw new Error('Guest Count Filter Values Not Found')

    return { min, max }
}


export const createReservationReview = async ({
    input,
    ctx
}: TUseCaseClientLayer<TClientReviewValidator.TMakeReview>) => {

    const { reviewId, data } = input

    await ReservationEntities.createReviewRatings({
        data: data.ratings.map((rating) => ({
            restaurantReviewId: rating.restaurantReviewId,
            reservationReviewId: reviewId,
            rating: rating.rating
        }))
    })



    const totalScore = data.ratings.reduce((acc, rating) => acc + rating.rating, 0) / data.ratings.length
    await ReservationEntities.updateReservationReview({
        reviewId,
        data: {
            status: EnumReviewStatus.REVIEWED,
            guestReview: data.guestReview,
            reviewedAt: new Date(),
            reviewScore: totalScore
        }
    })


}



