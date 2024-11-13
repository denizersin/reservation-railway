import { TReservation, TReservationNotificationInsert } from "@/server/db/schema"
import { NotificationEntities } from "../../entities/notification/reservation-notification"
import { EnumNotificationMessageType, EnumNotificationStatus, EnumNotificationType } from "@/shared/enums/predefined-enums"
import { ReservationLogEntities } from "../../entities/reservation/reservation-log"
import { guestEntities } from "../../entities/guest"

export const sendSms = async ({ }: {
    // number: string,
    // message: string
}) => {
    // Implement SMS sending
}

export const sendEmail = async ({ }: {
    // email: string,
    // message: string
}) => {
    // Implement Email sending
}

export const handlePrePayment = async ({
    reservation
}: {
    reservation: TReservation
}) => {
    const message = await NotificationEntities.generatePrePaymentNotification({
        reservation
    })

    const guest = await guestEntities.getGuestById({ guestId: reservation.guestId })
    const email = guest.isContactAssistant ? guest.assistantEmail : guest.email
    const phone = guest.isContactAssistant ? guest.assistantPhone : guest.phone

    const notification: TReservationNotificationInsert = {
        reservationId: reservation.id,
        type: EnumNotificationType.SMS,
        notificationMessageType: EnumNotificationMessageType.AskedForPrepayment,
        status: EnumNotificationStatus.SENT,
        message,
    }

    if (reservation.isSendEmail) {
        try {
            await sendEmail({});
            notification.type = EnumNotificationType.EMAIL
            await NotificationEntities.createReservationNotification(notification);
            await ReservationLogEntities.createLog({
                message: `sent email prepayment notification`,
                reservationId: reservation.id,
                owner: 'system'
            });
        } catch (e) {
            notification.status = EnumNotificationStatus.FAILED
            await NotificationEntities.createReservationNotification(notification);
            await ReservationLogEntities.createLog({
                message: `failed to send email prepayment notification`,
                reservationId: reservation.id,
                owner: 'system'
            });
        }
    }

    if (reservation.isSendSms) {
        try {
            await sendSms({});
            notification.type = EnumNotificationType.SMS
            await NotificationEntities.createReservationNotification(notification);
            await ReservationLogEntities.createLog({
                message: `sent sms prepayment notification`,
                reservationId: reservation.id,
                owner: 'system'
            });
        } catch (e) {
            notification.status = EnumNotificationStatus.FAILED
            await NotificationEntities.createReservationNotification(notification);
            await ReservationLogEntities.createLog({
                message: `failed to send sms prepayment notification`,
                reservationId: reservation.id,
                owner: 'system'
            });
        }
    }
}

export const handleReservationCreated = async ({
    reservation
}: {
    reservation: TReservation
}) => {
    const message = await NotificationEntities.generateReservationCreatedNotification({
        reservation
    })

    const guest = await guestEntities.getGuestById({ guestId: reservation.guestId })
    const email = guest.isContactAssistant ? guest.assistantEmail : guest.email
    const phone = guest.isContactAssistant ? guest.assistantPhone : guest.phone

    const notification: TReservationNotificationInsert = {
        reservationId: reservation.id,
        type: EnumNotificationType.SMS,
        notificationMessageType: EnumNotificationMessageType.ReservationCreated,
        status: EnumNotificationStatus.SENT,
        message,
    }

    if (reservation.isSendEmail) {
        try {
            await sendEmail({});
            notification.type = EnumNotificationType.EMAIL
            await NotificationEntities.createReservationNotification(notification);
            await ReservationLogEntities.createLog({
                message: `sent email reservation created notification`,
                reservationId: reservation.id,
                owner: 'system'
            });
        } catch (e) {
            notification.status = EnumNotificationStatus.FAILED
            await NotificationEntities.createReservationNotification(notification);
            await ReservationLogEntities.createLog({
                message: `failed to send email reservation created notification`,
                reservationId: reservation.id,
                owner: 'system'
            });
        }
    }

    if (reservation.isSendSms) {
        try {
            await sendSms({});
            notification.type = EnumNotificationType.SMS
            await NotificationEntities.createReservationNotification(notification);
            await ReservationLogEntities.createLog({
                message: `sent sms reservation created notification`,
                reservationId: reservation.id,
                owner: 'system'
            });
        } catch (e) {
            notification.status = EnumNotificationStatus.FAILED
            await NotificationEntities.createReservationNotification(notification);
            await ReservationLogEntities.createLog({
                message: `failed to send sms reservation created notification`,
                reservationId: reservation.id,
                owner: 'system'
            });
        }
    }
}

export const handleReservationCancelled = async ({
    reservation
}: {
    reservation: TReservation
}) => {
    const message = await NotificationEntities.generateReservationCancelledNotification({
        reservation
    })

    const guest = await guestEntities.getGuestById({ guestId: reservation.guestId })
    const email = guest.isContactAssistant ? guest.assistantEmail : guest.email
    const phone = guest.isContactAssistant ? guest.assistantPhone : guest.phone

    const notification: TReservationNotificationInsert = {
        reservationId: reservation.id,
        type: EnumNotificationType.SMS,
        notificationMessageType: EnumNotificationMessageType.ReservationCancellation,
        status: EnumNotificationStatus.SENT,
        message,
    }

    if (reservation.isSendEmail) {
        try {
            await sendEmail({});
            notification.type = EnumNotificationType.EMAIL
            await NotificationEntities.createReservationNotification(notification);
            await ReservationLogEntities.createLog({
                message: `sent email reservation cancelled notification`,
                reservationId: reservation.id,
                owner: 'system'
            });
        } catch (e) {
            notification.status = EnumNotificationStatus.FAILED
            await NotificationEntities.createReservationNotification(notification);
            await ReservationLogEntities.createLog({
                message: `failed to send email reservation cancelled notification`,
                reservationId: reservation.id,
                owner: 'system'
            });
        }
    }

    if (reservation.isSendSms) {
        try {
            await sendSms({});
            notification.type = EnumNotificationType.SMS
            await NotificationEntities.createReservationNotification(notification);
            await ReservationLogEntities.createLog({
                message: `sent sms reservation cancelled notification`,
                reservationId: reservation.id,
                owner: 'system'
            });
        } catch (e) {
            notification.status = EnumNotificationStatus.FAILED
            await NotificationEntities.createReservationNotification(notification);
            await ReservationLogEntities.createLog({
                message: `failed to send sms reservation cancelled notification`,
                reservationId: reservation.id,
                owner: 'system'
            });
        }
    }
}

export const handleReservationConfirmed = async ({
    reservation
}: {
    reservation: TReservation
}) => {
    const message = await NotificationEntities.generateReservationConfirmedNotification({
        reservation
    })

    const guest = await guestEntities.getGuestById({ guestId: reservation.guestId })
    const email = guest.isContactAssistant ? guest.assistantEmail : guest.email
    const phone = guest.isContactAssistant ? guest.assistantPhone : guest.phone

    const notification: TReservationNotificationInsert = {
        reservationId: reservation.id,
        type: EnumNotificationType.SMS,
        notificationMessageType: EnumNotificationMessageType.ReservationConfirmed,
        status: EnumNotificationStatus.SENT,
        message,
    }

    if (reservation.isSendEmail) {
        try {
            await sendEmail({});
            notification.type = EnumNotificationType.EMAIL
            await NotificationEntities.createReservationNotification(notification);
            await ReservationLogEntities.createLog({
                message: `sent email reservation confirmed notification`,
                reservationId: reservation.id,
                owner: 'system'
            });
        } catch (e) {
            notification.status = EnumNotificationStatus.FAILED
            await NotificationEntities.createReservationNotification(notification);
            await ReservationLogEntities.createLog({
                message: `failed to send email reservation confirmed notification`,
                reservationId: reservation.id,
                owner: 'system'
            });
        }
    }

    if (reservation.isSendSms) {
        try {
            await sendSms({});
            notification.type = EnumNotificationType.SMS
            await NotificationEntities.createReservationNotification(notification);
            await ReservationLogEntities.createLog({
                message: `sent sms reservation confirmed notification`,
                reservationId: reservation.id,
                owner: 'system'
            });
        } catch (e) {
            notification.status = EnumNotificationStatus.FAILED
            await NotificationEntities.createReservationNotification(notification);
            await ReservationLogEntities.createLog({
                message: `failed to send sms reservation confirmed notification`,
                reservationId: reservation.id,
                owner: 'system'
            });
        }
    }
}

export const handleConfirmationRequest = async ({
    reservation
}: {
    reservation: TReservation
}) => {
    const message = await NotificationEntities.generateConfirmationNotification({
        reservation
    })

    const guest = await guestEntities.getGuestById({ guestId: reservation.guestId })
    const email = guest.isContactAssistant ? guest.assistantEmail : guest.email
    const phone = guest.isContactAssistant ? guest.assistantPhone : guest.phone

    const notification: TReservationNotificationInsert = {
        reservationId: reservation.id,
        type: EnumNotificationType.SMS,
        notificationMessageType: EnumNotificationMessageType.ReservationConfirmationRequest,
        status: EnumNotificationStatus.SENT,
        message,
    }

    if (reservation.isSendEmail) {
        try {
            await sendEmail({});
            notification.type = EnumNotificationType.EMAIL
            await NotificationEntities.createReservationNotification(notification);
            await ReservationLogEntities.createLog({
                message: `sent email confirmation request notification`,
                reservationId: reservation.id,
                owner: 'system'
            });
        } catch (e) {
            notification.status = EnumNotificationStatus.FAILED
            await NotificationEntities.createReservationNotification(notification);
            await ReservationLogEntities.createLog({
                message: `failed to send email confirmation request notification`,
                reservationId: reservation.id,
                owner: 'system'
            });
        }
    }

    if (reservation.isSendSms) {
        try {
            await sendSms({});
            notification.type = EnumNotificationType.SMS
            await NotificationEntities.createReservationNotification(notification);
            await ReservationLogEntities.createLog({
                message: `sent sms confirmation request notification`,
                reservationId: reservation.id,
                owner: 'system'
            });
        } catch (e) {
            notification.status = EnumNotificationStatus.FAILED
            await NotificationEntities.createReservationNotification(notification);
            await ReservationLogEntities.createLog({
                message: `failed to send sms confirmation request notification`,
                reservationId: reservation.id,
                owner: 'system'
            });
        }
    }
}

export const handleNotifyPrepayment = async ({
    reservation
}: {
    reservation: TReservation
}) => {
    const message = await NotificationEntities.generateNotifyPrePaymentNotification({
        reservation
    })

    const guest = await guestEntities.getGuestById({ guestId: reservation.guestId })
    const email = guest.isContactAssistant ? guest.assistantEmail : guest.email
    const phone = guest.isContactAssistant ? guest.assistantPhone : guest.phone

    const notification: TReservationNotificationInsert = {
        reservationId: reservation.id,
        type: EnumNotificationType.SMS,
        notificationMessageType: EnumNotificationMessageType.NotifiedForPrepayment,
        status: EnumNotificationStatus.SENT,
        message,
    }

    if (reservation.isSendEmail) {
        try {
            await sendEmail({});
            notification.type = EnumNotificationType.EMAIL
            await NotificationEntities.createReservationNotification(notification);
            await ReservationLogEntities.createLog({
                message: `sent email notify prepayment notification`,
                reservationId: reservation.id,
                owner: 'system'
            });
        } catch (e) {
            notification.status = EnumNotificationStatus.FAILED
            await NotificationEntities.createReservationNotification(notification);
            await ReservationLogEntities.createLog({
                message: `failed to send email notify prepayment notification`,
                reservationId: reservation.id,
                owner: 'system'
            });
        }
    }

    if (reservation.isSendSms) {
        try {
            await sendSms({});
            notification.type = EnumNotificationType.SMS
            await NotificationEntities.createReservationNotification(notification);
            await ReservationLogEntities.createLog({
                message: `sent sms notify prepayment notification`,
                reservationId: reservation.id,
                owner: 'system'
            });
        } catch (e) {
            notification.status = EnumNotificationStatus.FAILED
            await NotificationEntities.createReservationNotification(notification);
            await ReservationLogEntities.createLog({
                message: `failed to send sms notify prepayment notification`,
                reservationId: reservation.id,
                owner: 'system'
            });
        }
    }



}

export const notificationUseCases = {
    handlePrePayment,
    handleReservationCreated,
    handleReservationCancelled,
    handleReservationConfirmed,
    handleConfirmationRequest,
    handleNotifyPrepayment
}