import { TReservation } from "@/server/db/schema"
import { NotificationEntities } from "../../entities/notification/reservation-notification"
import { EnumNotificationMessageType, EnumNotificationStatus, EnumNotificationType } from "@/shared/enums/predefined-enums"
import { ReservationLogEntities } from "../../entities/reservation/reservation-log"


export const sendSms = async ({ }: {
    // number: string,
    // message: string
}) => {

}

export const sendEmail = async ({ }: {
    // email: string,
    // message: string
}) => {

}


export const sendPrePaymentNotification = async ({
    reservation
}: {
    reservation: TReservation
}) => {

    const message = await NotificationEntities.generatePrePaymentNotification({
        reservation
    })

    if (reservation.isSendEmail) {
        console.log('send email')
        //send sms
        sendSms({})
            .then(async () => {
                await NotificationEntities.createReservationNotification({
                    reservationId: reservation.id,
                    type: EnumNotificationType.SMS,
                    notificationMessageType: EnumNotificationMessageType.AskedForPrepayment,
                    status: EnumNotificationStatus.SENT,
                    message,
                })
            })
            .catch(async (e) => {
                await NotificationEntities.createReservationNotification({
                    reservationId: reservation.id,
                    type: EnumNotificationType.SMS,
                    notificationMessageType: EnumNotificationMessageType.AskedForPrepayment,
                    status: EnumNotificationStatus.FAILED,
                    message,
                })
            })

        await ReservationLogEntities.createLog({
            message: `sent sms prepayment notification`,
            reservationId: reservation.id,
            owner: 'system'
        })

    }

    if (reservation.isSendSms) {

        //send email
        sendEmail({})
            .then(async () => {
                await NotificationEntities.createReservationNotification({
                    reservationId: reservation.id,
                    type: EnumNotificationType.EMAIL,
                    notificationMessageType: EnumNotificationMessageType.AskedForPrepayment,
                    status: EnumNotificationStatus.SENT,
                    message,
                })
            })
            .catch(async (e) => {
                await NotificationEntities.createReservationNotification({
                    reservationId: reservation.id,
                    type: EnumNotificationType.EMAIL,
                    notificationMessageType: EnumNotificationMessageType.AskedForPrepayment,
                    status: EnumNotificationStatus.FAILED,
                    message,
                })
            })

        await ReservationLogEntities.createLog({
            message: `sent email prepayment notification`,
            reservationId: reservation.id,
            owner: 'system'
        })
    }



}


export const notificationUseCases = {
    sendPrePaymentNotification
}