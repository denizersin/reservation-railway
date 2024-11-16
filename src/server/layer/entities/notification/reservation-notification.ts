import { db } from "@/server/db";
import { tblPrepaymentMessage, TGuestSelect, TReservation, TRestaurantWithoutTrns } from "@/server/db/schema";
import { tblReservationNotification, TReservationNotification, TReservationNotificationInsert } from "@/server/db/schema/reservation/notification";
import { reservationLinks } from "@/server/utils/front-link";
import { EnumLanguage, EnumNotificationType } from "@/shared/enums/predefined-enums";
import { and, eq } from "drizzle-orm";
import { LanguageEntity } from "../language";
import { DEFAULT_LANGUAGE } from "@/shared/data/predefined";
import { TRPCError } from "@trpc/server";


type MessageParams = {
    [key: string]: string; // Dinamik anahtar-değer çifti
};

function parseMessage(template: string, params: MessageParams): string {
    // Şablondaki tüm @param alanlarını verilen değerlerle değiştir
    return template.replace(/@(\w+)/g, (_, key) => {
        return params[key] || `@${key}`; // Değer yoksa parametre adı korunur
    });
}

export const getBaseParams = (reservation: TReservationMessageInstance) => {
    return {
        Client: reservation.guest.name,
        Date: reservation.reservationDate.toISOString(),
        Person: reservation.guestCount.toString(),
        Restaurant: reservation.restaurant.name
    }
}


export const createReservationNotification = async (data: TReservationNotificationInsert) => {
    const [result] = await db.insert(tblReservationNotification).values(data).$returningId()
    const notification = await db.query.tblReservationNotification.findFirst({
        where: eq(tblReservationNotification.id, result?.id!)
    })
    if (!notification) throw new Error('Notification not created')
    return notification
};


export const generateReservationCreatedNotification = async ({
    reservation,
    type
}: {
    reservation: TReservationMessageInstance,
    type: EnumNotificationType
}) => {

    const reservationLink = reservationLinks.detail({ reservationId: reservation.id })
    const emailLink = `<a href="${reservationLink}">${reservationLink}</a>`

    const link = type === EnumNotificationType.EMAIL ? emailLink : reservationLink

    const params: MessageParams = getBaseParams(reservation)
    params.Link = link

    const reservationMessage = await LanguageEntity.getReservationMessagesByLang({
        restaurantId: reservation.restaurantId,
        languageId: reservation.guest.languageId
    })

    const message = reservationMessage.newReservationMessage
    if (!message) throw new TRPCError({ code: 'NOT_FOUND', message: 'Reservation message not found' })
    const notificationMessage = parseMessage(message, params)

    return notificationMessage

}

export const generateReservationCancelledNotification = async ({
    reservation,
    type
}: {
    reservation: TReservationMessageInstance,
    type: EnumNotificationType
}) => {

    const params: MessageParams = getBaseParams(reservation)

    const reservationMessage = await LanguageEntity.getReservationMessagesByLang({
        restaurantId: reservation.restaurantId,
        languageId: reservation.guest.languageId
    })

    const msg = reservationMessage.reservationCancellationMessage

    if (!msg) throw new TRPCError({ code: 'NOT_FOUND', message: 'Reservation cancellation message not found' })
    const notificationMessage = parseMessage(msg, params)

    return notificationMessage
}
export const generateConfirmationNotification = async ({
    reservation,
    type
}: {
    reservation: TReservationMessageInstance,
    type: EnumNotificationType
}) => {

    const confirmationLink = reservationLinks.confirmation({ reservationId: reservation.id })
    const emailLink = `<a href="${confirmationLink}">${confirmationLink}</a>`

    const link = type === EnumNotificationType.EMAIL ? emailLink : confirmationLink

    const params: MessageParams = getBaseParams(reservation)
    params.Link = link

    const reservationMessage = await LanguageEntity.getReservationMessagesByLang({
        restaurantId: reservation.restaurantId,
        languageId: reservation.guest.languageId
    })

    const message = reservationMessage.reservationConfirmationRequestMessage
    if (!message) throw new TRPCError({ code: 'NOT_FOUND', message: 'Reservation confirmation message not found' })
    const notificationMessage = parseMessage(message, params)

    return notificationMessage
}

export const generateReservationConfirmedNotification = async ({
    reservation,
    type
}: {
    reservation: TReservationMessageInstance,
    type: EnumNotificationType
}) => {


    const params: MessageParams = getBaseParams(reservation)

    const reservationMessage = await LanguageEntity.getReservationMessagesByLang({
        restaurantId: reservation.restaurantId,
        languageId: reservation.guest.languageId
    })

    const message = reservationMessage.reservationConfirmedMessage
    if (!message) throw new TRPCError({ code: 'NOT_FOUND', message: 'Reservation confirmed message not found' })
    const notificationMessage = parseMessage(message, params)

    return notificationMessage
}


export const generateNotifyPrePaymentNotification = async ({
    reservation,
    type
}: {
    reservation: TReservationMessageInstance,
    type: EnumNotificationType
}) => {

    const prepaymentLink = reservationLinks.prepayment({ reservationId: reservation.id })
    const emailLink = `<a href="${prepaymentLink}">${prepaymentLink}</a>`

    const link = type === EnumNotificationType.EMAIL ? emailLink : prepaymentLink

    const params: MessageParams = getBaseParams(reservation)
    params.Link = link

    const reservationMessage = await LanguageEntity.getPrepaymentMessagesByLang({
        restaurantId: reservation.restaurantId,
        languageId: reservation.guest.languageId
    })

    const message = reservationMessage.prepaymentReminderMessage
    if (!message) throw new TRPCError({ code: 'NOT_FOUND', message: 'Reservation prepayment reminder message not found' })
    const notificationMessage = parseMessage(message, params)

    return notificationMessage
}

export const generatePrePaymentNotification = async ({
    reservation,
    type
}: {
    reservation: TReservationMessageInstance,
    type: EnumNotificationType
}) => {

    const prepaymentLink = reservationLinks.prepayment({ reservationId: reservation.id })
    const emailLink = `<a href="${prepaymentLink}">${prepaymentLink}</a>`

    const link = type === EnumNotificationType.EMAIL ? emailLink : prepaymentLink

    const params: MessageParams = getBaseParams(reservation)
    params.Link = link

    const guest = reservation.guest

    const restaurantPrepaymentMessages = await LanguageEntity.getPrepaymentMessagesByLang({
        restaurantId: reservation.restaurantId,
        languageId: guest.languageId
    })

    const msg = restaurantPrepaymentMessages?.accountPaymentRequestMessage

    if (!msg) throw new TRPCError({ code: 'NOT_FOUND', message: 'Prepayment message not found' })

    const notificationMessage = parseMessage(msg, params)

    return notificationMessage
}


export const updateNotification = (data: Partial<TReservationNotification> & {
    id: number
}) => {
    return db.update(tblReservationNotification).set(data).where(eq(tblReservationNotification.id, data.id))

}

export const generateReservationGuestCountChange = async ({
    reservation,
    oldGuestCount,
    newGuestCount,
    type
}: {
    reservation: TReservationMessageInstance,
    oldGuestCount: string,
    newGuestCount: string,
    type: EnumNotificationType
}) => {



    const params: MessageParams = getBaseParams(reservation)
    const restaurantReservationMessages = await LanguageEntity.getReservationMessagesByLang({
        restaurantId: reservation.restaurantId,
        languageId: reservation.guest.languageId
    })

    const message = restaurantReservationMessages.guestCountChangeMessage
    if (!message) throw new TRPCError({ code: 'NOT_FOUND', message: 'Reservation guest count change message not found' })
    const notificationMessage = parseMessage(message, params)

    return notificationMessage
}

export const generateReservationTimeChange = async ({
    reservation,
    oldTime,
    newTime,
    type
}: {
    reservation: TReservationMessageInstance,
    oldTime: string,
    newTime: string,
    type: EnumNotificationType
}) => {

    const params: MessageParams = {
        ...getBaseParams(reservation),
        Date: newTime
    }
    const restaurantReservationMessages = await LanguageEntity.getReservationMessagesByLang({
        restaurantId: reservation.restaurantId,
        languageId: reservation.guest.languageId
    })

    const message = restaurantReservationMessages.dateTimeChangeMessage
    if (!message) throw new TRPCError({ code: 'NOT_FOUND', message: 'Reservation date time change message not found' })
    const notificationMessage = parseMessage(message, params)

    return notificationMessage

}



export const NotificationEntities = {
    createReservationNotification,
    updateNotification,
    generateReservationCreatedNotification,
    generatePrePaymentNotification,
    generateReservationCancelledNotification,
    generateReservationConfirmedNotification,
    generateConfirmationNotification,
    generateNotifyPrePaymentNotification,
    generateReservationGuestCountChange,
    generateReservationTimeChange,
}



export type TReservationMessageInstance = TReservation & {
    guest: TGuestSelect
    restaurant: TRestaurantWithoutTrns
}
