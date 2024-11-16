import { TCtx } from "@/server/api/trpc"
import { TReservationNotificationInsert } from "@/server/db/schema"
import { EnumNotificationMessageType, EnumNotificationStatus, EnumNotificationType } from "@/shared/enums/predefined-enums"
import { NotificationEntities, TReservationMessageInstance } from "../../entities/notification/reservation-notification"
import { ReservationEntities } from "../../entities/reservation"
import { ReservationLogEntities } from "../../entities/reservation/reservation-log"



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
    reservationId,
    withSms,
    withEmail,
    ctx
}: {
    reservationId: number
    withSms: boolean
    withEmail: boolean,
    ctx: TCtx
}) => {
    const reservationWithGuest = await ReservationEntities.geTReservationMessageInstance({
        reservationId
    })

    const emailMessage = withEmail ? await NotificationEntities.generatePrePaymentNotification({
        reservation: reservationWithGuest,
        type: EnumNotificationType.EMAIL
    }) : ''

    const smsMessage = withSms ? await NotificationEntities.generatePrePaymentNotification({
        reservation: reservationWithGuest,
        type: EnumNotificationType.SMS
    }) : ''

    const guest = reservationWithGuest.guest
    const email = guest.isContactAssistant ? guest.assistantEmail : guest.email
    const phone = guest.isContactAssistant ? guest.assistantPhone : guest.phone


    if (withSms && !phone) {
        // toastOptions.setToast('Phone not set')
    }

    if (withEmail && !email) {
        // toastOptions.setToast('Email not set')
    }

    await handleNotificationSending({
        reservation: reservationWithGuest,
        notificationType: EnumNotificationMessageType.AskedForPrepayment,
        emailMessage,
        smsMessage,
        shouldSendEmail: withEmail,
        shouldSendSms: withSms,
        logPrefix: 'prepayment notification',
        ctx
    })
}

export const handlePrepaymentCancelled = async ({
    reservationId,
    withSms,
    withEmail,
    ctx
}: NotificationHandlerParams) => {

}

const handleNotificationSending = async ({
    reservation,
    notificationType,
    emailMessage,
    smsMessage,
    shouldSendEmail,
    shouldSendSms,
    logPrefix,
    ctx
}: {
    reservation: TReservationMessageInstance
    notificationType: EnumNotificationMessageType
    shouldSendEmail: boolean
    shouldSendSms: boolean
    logPrefix: string,
    emailMessage: string,
    smsMessage: string,
    ctx: TCtx
}) => {
    const guest = reservation.guest
    const email = guest.isContactAssistant ? guest.assistantEmail : guest.email
    const phone = guest.isContactAssistant ? guest.assistantPhone : guest.phone

    const notification: TReservationNotificationInsert = {
        reservationId: reservation.id,
        type: EnumNotificationType.SMS,
        notificationMessageType: notificationType,
        status: EnumNotificationStatus.SENT,
        message: emailMessage,
    }

    if (shouldSendEmail && email) {
        try {
            await sendEmail({});
            notification.type = EnumNotificationType.EMAIL
            await NotificationEntities.createReservationNotification(notification);
            await ReservationLogEntities.createLog({
                message: `sent email ${logPrefix}`,
                reservationId: reservation.id,
                owner: 'system'
            });
        } catch (e) {
            notification.status = EnumNotificationStatus.FAILED
            await NotificationEntities.createReservationNotification(notification);
            await ReservationLogEntities.createLog({
                message: `failed to send email ${logPrefix}`,
                reservationId: reservation.id,
                owner: 'system'
            });
        }
    }

    if (shouldSendSms && phone) {
        notification.message = smsMessage
        try {
            await sendSms({});
            notification.type = EnumNotificationType.SMS
            await NotificationEntities.createReservationNotification(notification);
            await ReservationLogEntities.createLog({
                message: `sent sms ${logPrefix}`,
                reservationId: reservation.id,
                owner: 'system'
            });
        } catch (e) {
            notification.status = EnumNotificationStatus.FAILED
            await NotificationEntities.createReservationNotification(notification);
            await ReservationLogEntities.createLog({
                message: `failed to send sms ${logPrefix}`,
                reservationId: reservation.id,
                owner: 'system'
            });
        }
    }
}

type NotificationHandlerParams = {
    reservationId: number
    withSms: boolean
    withEmail: boolean
    ctx: TCtx
}

export const handleReservationCreated = async ({
    reservationId,
    withSms,
    withEmail,
    ctx
}: NotificationHandlerParams) => {
    const reservationWithGuest = await ReservationEntities.geTReservationMessageInstance({
        reservationId
    })

    const guest = reservationWithGuest.guest
    const email = guest.isContactAssistant ? guest.assistantEmail : guest.email
    const phone = guest.isContactAssistant ? guest.assistantPhone : guest.phone

    if (withSms && !phone) {
        // toastOptions.setToast('Phone not set')
    }

    if (withEmail && !email) {
        // toastOptions.setToast('Email not set')
    }

    const emailMessage = withEmail ? await NotificationEntities.generateReservationCreatedNotification({
        reservation: reservationWithGuest,
        type: EnumNotificationType.EMAIL
    }) : ''

    const smsMessage = withSms ? await NotificationEntities.generateReservationCreatedNotification({
        reservation: reservationWithGuest,
        type: EnumNotificationType.SMS
    }) : ''


    await handleNotificationSending({
        reservation: reservationWithGuest,
        notificationType: EnumNotificationMessageType.ReservationCreated,
        emailMessage,
        smsMessage,
        shouldSendEmail: withEmail,
        shouldSendSms: withSms,
        logPrefix: 'reservation created notification',
        ctx
    })
}

export const handleReservationCancelled = async ({
    reservationId,
    withSms,
    withEmail,
    ctx
}: NotificationHandlerParams) => {
    const reservationWithGuest = await ReservationEntities.geTReservationMessageInstance({
        reservationId
    })

    const guest = reservationWithGuest.guest
    const email = guest.isContactAssistant ? guest.assistantEmail : guest.email
    const phone = guest.isContactAssistant ? guest.assistantPhone : guest.phone

    if (withSms && !phone) {
        // toastOptions.setToast('Phone not set')
    }

    if (withEmail && !email) {
        // toastOptions.setToast('Email not set')
    }

    const emailMessage = withEmail ? await NotificationEntities.generateReservationCancelledNotification({
        reservation: reservationWithGuest,
        type: EnumNotificationType.EMAIL
    }) : ''

    const smsMessage = withSms ? await NotificationEntities.generateReservationCancelledNotification({
        reservation: reservationWithGuest,
        type: EnumNotificationType.SMS
    }) : ''

    await handleNotificationSending({
        reservation: reservationWithGuest,
        notificationType: EnumNotificationMessageType.ReservationCancellation,
        emailMessage,
        smsMessage,
        shouldSendEmail: withEmail,
        shouldSendSms: withSms,
        logPrefix: 'reservation cancelled notification',
        ctx
    })
}

export const handleReservationConfirmed = async ({
    reservationId,
    withSms,
    withEmail,
    ctx
}: NotificationHandlerParams) => {
    const reservationWithGuest = await ReservationEntities.geTReservationMessageInstance({
        reservationId
    })

    const guest = reservationWithGuest.guest
    const email = guest.isContactAssistant ? guest.assistantEmail : guest.email
    const phone = guest.isContactAssistant ? guest.assistantPhone : guest.phone

    if (withSms && !phone) {
        // toastOptions.setToast('Phone not set')
    }

    if (withEmail && !email) {
        // toastOptions.setToast('Email not set')
    }

    const emailMessage = withEmail ? await NotificationEntities.generateReservationConfirmedNotification({
        reservation: reservationWithGuest,
        type: EnumNotificationType.EMAIL
    }) : ''

    const smsMessage = withSms ? await NotificationEntities.generateReservationConfirmedNotification({
        reservation: reservationWithGuest,
        type: EnumNotificationType.SMS
    }) : ''

    await handleNotificationSending({
        reservation: reservationWithGuest,
        notificationType: EnumNotificationMessageType.ReservationConfirmed,
        emailMessage,
        smsMessage,
        shouldSendEmail: withEmail,
        shouldSendSms: withSms,
        logPrefix: 'reservation confirmed notification',
        ctx
    })
}

export const handleConfirmationRequest = async ({
    reservationId,
    withSms,
    withEmail,
    ctx
}: NotificationHandlerParams) => {
    const reservationWithGuest = await ReservationEntities.geTReservationMessageInstance({
        reservationId
    })

    const guest = reservationWithGuest.guest
    const email = guest.isContactAssistant ? guest.assistantEmail : guest.email
    const phone = guest.isContactAssistant ? guest.assistantPhone : guest.phone

    if (withSms && !phone) {
        // toastOptions.setToast('Phone not set')
    }

    if (withEmail && !email) {
        // toastOptions.setToast('Email not set')
    }

    const emailMessage = withEmail ? await NotificationEntities.generateConfirmationNotification({
        reservation: reservationWithGuest,
        type: EnumNotificationType.EMAIL
    }) : ''

    const smsMessage = withSms ? await NotificationEntities.generateConfirmationNotification({
        reservation: reservationWithGuest,
        type: EnumNotificationType.SMS
    }) : ''

    await handleNotificationSending({
        reservation: reservationWithGuest,
        notificationType: EnumNotificationMessageType.ReservationConfirmationRequest,
        emailMessage,
        smsMessage,
        shouldSendEmail: withEmail,
        shouldSendSms: withSms,
        logPrefix: 'confirmation request notification',
        ctx
    })
}

export const handleConfirmationRequestCancelled = async ({
    reservationId,
    withSms,
    withEmail,
    ctx
}: NotificationHandlerParams) => {

}


export const handleNotifyPrepayment = async ({
    reservationId,
    withSms,
    withEmail,
    ctx
}: NotificationHandlerParams) => {
    const reservationWithGuest = await ReservationEntities.geTReservationMessageInstance({
        reservationId
    })

    const guest = reservationWithGuest.guest
    const email = guest.isContactAssistant ? guest.assistantEmail : guest.email
    const phone = guest.isContactAssistant ? guest.assistantPhone : guest.phone

    if (withSms && !phone) {
        // toastOptions.setToast('Phone not set')
    }

    if (withEmail && !email) {
        // toastOptions.setToast('Email not set')
    }

    const emailMessage = withEmail ? await NotificationEntities.generateNotifyPrePaymentNotification({
        reservation: reservationWithGuest,
        type: EnumNotificationType.EMAIL
    }) : ''

    const smsMessage = withSms ? await NotificationEntities.generateNotifyPrePaymentNotification({
        reservation: reservationWithGuest,
        type: EnumNotificationType.SMS
    }) : ''

    await handleNotificationSending({
        reservation: reservationWithGuest,
        notificationType: EnumNotificationMessageType.NotifiedForPrepayment,
        emailMessage,
        smsMessage,
        shouldSendEmail: withEmail,
        shouldSendSms: withSms,
        logPrefix: 'notify prepayment notification',
        ctx
    })
}

export const handleReservationGuestCountChange = async ({
    reservationId,
    oldValue,
    newValue,
    withSms,
    withEmail,
    ctx
}: NotificationHandlerParams & {
    oldValue: string,
    newValue: string
}) => {
    const reservationWithGuest = await ReservationEntities.geTReservationMessageInstance({
        reservationId
    })

    const emailMessage = withEmail ? await NotificationEntities.generateReservationGuestCountChange({
        reservation: reservationWithGuest,
        oldGuestCount: oldValue,
        newGuestCount: newValue,
        type: EnumNotificationType.EMAIL
    }) : ''

    const smsMessage = withSms ? await NotificationEntities.generateReservationGuestCountChange({
        reservation: reservationWithGuest,
        oldGuestCount: oldValue,
        newGuestCount: newValue,
        type: EnumNotificationType.SMS
    }) : ''

    await handleNotificationSending({
        reservation: reservationWithGuest,
        notificationType: EnumNotificationMessageType.ReservationGuestCountChange,
        emailMessage,
        smsMessage,
        shouldSendEmail: withEmail,
        shouldSendSms: withSms,
        logPrefix: 'reservation guest count change notification',
        ctx
    })
}

export const handleReservationTimeChange = async ({
    reservationId,
    oldValue,
    newValue,
    withSms,
    withEmail,
    ctx
}: NotificationHandlerParams & { oldValue: string, newValue: string }) => {

    const reservationWithGuest = await ReservationEntities.geTReservationMessageInstance({
        reservationId
    })

    const emailMessage = withEmail ? await NotificationEntities.generateReservationTimeChange({
        reservation: reservationWithGuest,
        oldTime: oldValue,
        newTime: newValue,
        type: EnumNotificationType.EMAIL
    }) : ''

    const smsMessage = withSms ? await NotificationEntities.generateReservationTimeChange({
        reservation: reservationWithGuest,
        oldTime: oldValue,
        newTime: newValue,
        type: EnumNotificationType.SMS
    }) : ''

    await handleNotificationSending({
        reservation: reservationWithGuest,
        notificationType: EnumNotificationMessageType.ReservationTimeChange,
        emailMessage,
        smsMessage,
        shouldSendEmail: withEmail,
        shouldSendSms: withSms,
        logPrefix: 'reservation time change notification',
        ctx
    })
}






export const notificationUseCases = {
    handlePrePayment,
    handleReservationCreated,
    handleReservationCancelled,
    handleReservationConfirmed,
    handleConfirmationRequest,
    handleConfirmationRequestCancelled,
    handleNotifyPrepayment,
    handleReservationGuestCountChange,
    handleReservationTimeChange,
    handlePrepaymentCancelled
}
