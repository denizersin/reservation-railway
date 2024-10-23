import { db } from "@/server/db";
import { tblReservation } from "@/server/db/schema";
import { EnumNotificationMessageType, EnumNotificationStatus, EnumNotificationType } from "@/shared/enums/predefined-enums";
import { eq } from "drizzle-orm";
import { NotificationEntities } from "../../entities/notification";

export const sendEmail = async ({
    // email,
    // subject,
    // message
}: {
        // email: string,
        // subject: string,
        // message: string
    }) => {
    // console.log(`Sending email to ${email} with subject: ${subject} and message: ${message}`);
    return true;
}


export const sendSMS = async ({
    // phoneNumber,
    // message
}: {
        // phoneNumber: string,
        // message: string
    }) => {
    // console.log(`Sending SMS to ${phoneNumber} with message: ${message}`);
    return true;
}


export const sendNotificationToReservation = async ({
    reservationId,
    sendTo,
    notificationMessageType,
}: {
    reservationId: number,
    notificationMessageType: EnumNotificationMessageType,
    sendTo: EnumNotificationType[],
}) => {

    sendTo.map(async notificationType => {
        const message = `You have a new notification for your reservation.`
        const notif = await NotificationEntities.createReservationNotification({
            reservationId,
            type: notificationType,
            notificationMessageType,
            message,
            status: EnumNotificationStatus.PENDING
        })
        if (notificationType === EnumNotificationType.EMAIL) {
            sendEmail({})
                .then(() => NotificationEntities.updateNotification({ id: notif.id, status: EnumNotificationStatus.SENT }))
                .catch(() => NotificationEntities.updateNotification({ id: notif.id, status: EnumNotificationStatus.FAILED }))

        }
        if (notificationType === EnumNotificationType.SMS) {
            sendSMS({})
                .then(() => NotificationEntities.updateNotification({ id: notif.id, status: EnumNotificationStatus.SENT }))
                .catch(() => NotificationEntities.updateNotification({ id: notif.id, status: EnumNotificationStatus.FAILED }))
        }

    })

}

