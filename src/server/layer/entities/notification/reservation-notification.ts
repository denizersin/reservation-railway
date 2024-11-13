import { languagesData } from "@/server/data";
import { db } from "@/server/db";
import { tblGuest, tblPrepayment, tblPrepaymentMessage, TReservation } from "@/server/db/schema";
import { tblReservationNotification, TReservationNotification, TReservationNotificationInsert } from "@/server/db/schema/reservation/notification";
import { reservationLinks } from "@/server/utils/front-link";
import { EnumLanguage } from "@/shared/enums/predefined-enums";
import { and, eq } from "drizzle-orm";

export const createReservationNotification = async (data: TReservationNotificationInsert) => {
    const [result] = await db.insert(tblReservationNotification).values(data).$returningId()
    const notification = await db.query.tblReservationNotification.findFirst({
        where: eq(tblReservationNotification.id, result?.id!)
    })
    if (!notification) throw new Error('Notification not created')
    return notification
};


export const generateReservationCreatedNotification = async ({
    reservation
}: {
    reservation: TReservation
}) => {
    const guest = await db.query.tblGuest.findFirst({
        where: eq(tblGuest.id, reservation.guestId)
    })
    if (!guest) throw new Error('Guest not found')


    return `${guest.name} has created a reservation`


}


export const generatePrePaymentNotification = async ({
    reservation
}: {
    reservation: TReservation
}) => {

    const guest = await db.query.tblGuest.findFirst({
        where: eq(tblGuest.id, reservation.guestId)
    })

    let restaurantPrepaymentMessages = await db.query.tblPrepaymentMessage.findFirst({
        where: and(
            eq(tblPrepaymentMessage.restaurantId, reservation.restaurantId),
            eq(tblPrepaymentMessage.languageId, guest!.languageId)
        )
    })
    if (!restaurantPrepaymentMessages) {
        restaurantPrepaymentMessages = await db.query.tblPrepaymentMessage.findFirst({
            where: and(
                eq(tblPrepaymentMessage.restaurantId, reservation.restaurantId),
                eq(tblPrepaymentMessage.languageId, languagesData.find(l => l.languageCode === EnumLanguage.en)!.id)
            )
        })
    }

    const msg = restaurantPrepaymentMessages!.accountPaymentRequestMessage



    const prepaymentLink = reservationLinks.prepayment({ reservationId: reservation.id })

    const message = `${guest!.name} 
    ${msg}
    ${prepaymentLink}
    `
    return message

}

export const generateReservationCancelledNotification = async ({
    reservation
}: {
    reservation: TReservation
}) => {
    return `your reservation has been cancelled`
}

export const generateReservationConfirmedNotification = async ({
    reservation
}: {
    reservation: TReservation
}) => {
    return `your reservation has been confirmed`
}

export const generateConfirmationNotification = async ({
    reservation
}: {
    reservation: TReservation
}) => {
    return `Will you be able to come to the restaurant?`
}

export const generateNotifyPrePaymentNotification = async ({
    reservation
}: {
    reservation: TReservation
}) => {
    return `your need to pay the reservation`
}





export const updateNotification = (data: Partial<TReservationNotification> & {
    id: number
}) => {
    return db.update(tblReservationNotification).set(data).where(eq(tblReservationNotification.id, data.id))

}

export const NotificationEntities = {
    createReservationNotification,
    updateNotification,
    generateReservationCreatedNotification,
    generatePrePaymentNotification,
    generateReservationCancelledNotification,
    generateReservationConfirmedNotification,
    generateConfirmationNotification,
    generateNotifyPrePaymentNotification
}
