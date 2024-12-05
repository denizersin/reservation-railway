import { TReservationNotificationInsert, TWaitlistNotificationInsert } from "@/server/db/schema"
import { EnumNotificationMessageType, EnumNotificationMessageTypeNumeric, EnumNotificationStatus, EnumNotificationType, EnumWaitlistNotificationMessageType } from "@/shared/enums/predefined-enums"
import { NotificationEntities, TReservationMessageInstance, TWaitlistMessageInstance } from "../../entities/notification/reservation-notification"
import { ReservationEntities } from "../../entities/reservation"
import { ReservationLogEntities } from "../../entities/reservation/reservation-log"
import { waitlistEntities } from "../../entities/waitlist"
import { mailService } from "../../service/notification"



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
}: {
    reservationId: number
    withSms: boolean
    withEmail: boolean,
}) => {
    const reservationMessageInstance = await ReservationEntities.geTReservationMessageInstance({
        reservationId
    })

    const emailMessage = withEmail ? await NotificationEntities.generatePrePaymentNotification({
        reservation: reservationMessageInstance,
        type: EnumNotificationType.EMAIL
    }) : ''

    const smsMessage = withSms ? await NotificationEntities.generatePrePaymentNotification({
        reservation: reservationMessageInstance,
        type: EnumNotificationType.SMS
    }) : ''

    const guest = reservationMessageInstance.guest
    const email = guest.isContactAssistant ? guest.assistantEmail : guest.email
    const phone = guest.isContactAssistant ? guest.assistantPhone : guest.phone


    if (withSms && !phone) {
        // toastOptions.setToast('Phone not set')
    }

    if (withEmail && !email) {
        // toastOptions.setToast('Email not set')
    }

    await handleNotificationSending({
        reservation: reservationMessageInstance,
        notificationType: EnumNotificationMessageType.AskedForPrepayment,
        notificationMessageTypeId: EnumNotificationMessageTypeNumeric[EnumNotificationMessageType.AskedForPrepayment],
        emailMessage,
        smsMessage,
        shouldSendEmail: withEmail,
        shouldSendSms: withSms,
        logPrefix: 'prepayment notification',
    })


    
}

    export const handlePrepaymentCancelled = async ({
        reservationId,
        withSms,
        withEmail,
    }: {
        reservationId: number
        withSms: boolean
        withEmail: boolean,
    }) => {
        const reservationMessageInstance = await ReservationEntities.geTReservationMessageInstance({
            reservationId
        })
    
        const emailMessage = withEmail ? await NotificationEntities.generatePrePaymentCancelledNotification({
            reservation: reservationMessageInstance,
            type: EnumNotificationType.EMAIL
        }) : ''
    
        const smsMessage = withSms ? await NotificationEntities.generatePrePaymentCancelledNotification({
            reservation: reservationMessageInstance,
            type: EnumNotificationType.SMS
        }) : ''
    
        const guest = reservationMessageInstance.guest
        const email = guest.isContactAssistant ? guest.assistantEmail : guest.email
        const phone = guest.isContactAssistant ? guest.assistantPhone : guest.phone
    
    
        if (withSms && !phone) {
            // toastOptions.setToast('Phone not set')
        }
    
        if (withEmail && !email) {
            // toastOptions.setToast('Email not set')
        }
    
        await handleNotificationSending({
            reservation: reservationMessageInstance,
            notificationType: EnumNotificationMessageType.AskedForPrepayment,
            notificationMessageTypeId: EnumNotificationMessageTypeNumeric[EnumNotificationMessageType.AskedForPrepayment],
            emailMessage,
            smsMessage,
            shouldSendEmail: withEmail,
            shouldSendSms: withSms,
            logPrefix: 'prepayment notification',
        })
    
    
        
    }

const handleNotificationSending = async ({
    reservation,
    notificationType,
    emailMessage,
    smsMessage,
    shouldSendEmail,
    shouldSendSms,
    logPrefix,
}: {
    reservation: TReservationMessageInstance
    notificationType: EnumNotificationMessageType
    notificationMessageTypeId: number
    shouldSendEmail: boolean
    shouldSendSms: boolean
    logPrefix: string,
    emailMessage: string,
    smsMessage: string,
}) => {
    const guest = reservation.guest
    const email = guest.isContactAssistant ? guest.assistantEmail : guest.email
    const phone = guest.isContactAssistant ? guest.assistantPhone : guest.phone

    const notification: TReservationNotificationInsert = {
        reservationId: reservation.id,
        type: EnumNotificationType.SMS,
        notificationMessageType: notificationType,
        notificationMessageTypeId: EnumNotificationMessageTypeNumeric[notificationType],
        status: EnumNotificationStatus.SENT,
        message: emailMessage,
    }

    if (shouldSendEmail && email) {
        notification.type = EnumNotificationType.EMAIL
        try {
            await mailService.sendMail({
                to: email,
                subject: "Reservation",
                html: emailMessage
            });
            notification.sentAt = new Date()
            await NotificationEntities.createReservationNotification(notification);
            await ReservationLogEntities.createLog({
                message: `sent email ${logPrefix}`,
                reservationId: reservation.id,
                owner: 'system'
            });
        } catch (e) {
            console.log(e, 'error sending email',notificationType)
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
        notification.type = EnumNotificationType.SMS

        try {
            await sendSms({});
            notification.sentAt = new Date()
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

const handleWaitlistNotificationSending = async ({
    waitlist,
    notificationType,
    shouldSendEmail,
    shouldSendSms,
    logPrefix,
    emailMessage,
    smsMessage,
}: {
    waitlist: TWaitlistMessageInstance
    notificationType: EnumWaitlistNotificationMessageType
    shouldSendEmail: boolean
    shouldSendSms: boolean
    logPrefix: string,
    emailMessage: string,
    smsMessage: string,
}) => {
    const guest = waitlist.guest
    const email = guest.isContactAssistant ? guest.assistantEmail : guest.email
    const phone = guest.isContactAssistant ? guest.assistantPhone : guest.phone

    const notification: TWaitlistNotificationInsert = {
        waitlistId: waitlist.id,
        type: EnumNotificationType.SMS,
        notificationMessageType: notificationType,
        status: EnumNotificationStatus.SENT,
        message: emailMessage,
    }

    if (shouldSendEmail && email) {
        try {
            await sendEmail({});
            notification.type = EnumNotificationType.EMAIL
            await NotificationEntities.createWaitlistNotification(notification);
        } catch (e) {
            notification.status = EnumNotificationStatus.FAILED
            await NotificationEntities.createWaitlistNotification(notification);
        }
    }

    if (shouldSendSms && phone) {
        notification.message = smsMessage
        try {
            await sendSms({});
            notification.type = EnumNotificationType.SMS
            await NotificationEntities.createWaitlistNotification(notification);
        } catch (e) {
            notification.status = EnumNotificationStatus.FAILED
            await NotificationEntities.createWaitlistNotification(notification);
        }
    }
}

type NotificationHandlerParams = {
    reservationId: number
    withSms: boolean
    withEmail: boolean
}

type WaitlistNotificationHandlerParams = {
    waitlistId: number
    withSms: boolean
    withEmail: boolean
}

export const handleReservationCreated = async ({
    reservationId,
    withSms,
    withEmail,
}: NotificationHandlerParams) => {
    const reservationMessageInstance = await ReservationEntities.geTReservationMessageInstance({
        reservationId
    })

    const guest = reservationMessageInstance.guest
    const email = guest.isContactAssistant ? guest.assistantEmail : guest.email
    const phone = guest.isContactAssistant ? guest.assistantPhone : guest.phone

    if (withSms && !phone) {
        // toastOptions.setToast('Phone not set')
    }

    if (withEmail && !email) {
        // toastOptions.setToast('Email not set')
    }

    const emailMessage = withEmail ? await NotificationEntities.generateReservationCreatedNotification({
        reservation: reservationMessageInstance,
        type: EnumNotificationType.EMAIL
    }) : ''

    const smsMessage = withSms ? await NotificationEntities.generateReservationCreatedNotification({
        reservation: reservationMessageInstance,
        type: EnumNotificationType.SMS
    }) : ''


    await handleNotificationSending({
        reservation: reservationMessageInstance,
        notificationType: EnumNotificationMessageType.ReservationCreated,
        notificationMessageTypeId: EnumNotificationMessageTypeNumeric[EnumNotificationMessageType.ReservationCreated],
        emailMessage,
        smsMessage,
        shouldSendEmail: withEmail,
        shouldSendSms: withSms,
        logPrefix: 'reservation created notification',
    })

    await ReservationLogEntities.createLog({
        message: `Reservation created notification sent`,
        reservationId,
        owner: 'system',
    })
}

export const handleReservationCancelled = async ({
    reservationId,
    withSms,
    withEmail,
}: NotificationHandlerParams) => {
    const reservationMessageInstance = await ReservationEntities.geTReservationMessageInstance({
        reservationId
    })

    const guest = reservationMessageInstance.guest
    const email = guest.isContactAssistant ? guest.assistantEmail : guest.email
    const phone = guest.isContactAssistant ? guest.assistantPhone : guest.phone

    if (withSms && !phone) {
        // toastOptions.setToast('Phone not set')
    }

    if (withEmail && !email) {
        // toastOptions.setToast('Email not set')
    }

    const emailMessage = withEmail ? await NotificationEntities.generateReservationCancelledNotification({
        reservation: reservationMessageInstance,
        type: EnumNotificationType.EMAIL
    }) : ''

    const smsMessage = withSms ? await NotificationEntities.generateReservationCancelledNotification({
        reservation: reservationMessageInstance,
        type: EnumNotificationType.SMS
    }) : ''

    await handleNotificationSending({
        reservation: reservationMessageInstance,
        notificationType: EnumNotificationMessageType.ReservationCancellation,
        notificationMessageTypeId: EnumNotificationMessageTypeNumeric[EnumNotificationMessageType.ReservationCancellation],
        emailMessage,
        smsMessage,
        shouldSendEmail: withEmail,
        shouldSendSms: withSms,
        logPrefix: 'reservation cancelled notification',
    })
}

export const handleReservationConfirmed = async ({
    reservationId,
    withSms,
    withEmail,
}: NotificationHandlerParams) => {
    const reservationMessageInstance = await ReservationEntities.geTReservationMessageInstance({
        reservationId
    })

    const guest = reservationMessageInstance.guest
    const email = guest.isContactAssistant ? guest.assistantEmail : guest.email
    const phone = guest.isContactAssistant ? guest.assistantPhone : guest.phone

    if (withSms && !phone) {
        // toastOptions.setToast('Phone not set')
    }

    if (withEmail && !email) {
        // toastOptions.setToast('Email not set')
    }

    const emailMessage = withEmail ? await NotificationEntities.generateReservationConfirmedNotification({
        reservation: reservationMessageInstance,
        type: EnumNotificationType.EMAIL
    }) : ''

    const smsMessage = withSms ? await NotificationEntities.generateReservationConfirmedNotification({
        reservation: reservationMessageInstance,
        type: EnumNotificationType.SMS
    }) : ''

    await handleNotificationSending({
        reservation: reservationMessageInstance,
        notificationType: EnumNotificationMessageType.ReservationConfirmed,
        notificationMessageTypeId: EnumNotificationMessageTypeNumeric[EnumNotificationMessageType.ReservationConfirmed],
        emailMessage,
        smsMessage,
        shouldSendEmail: withEmail,
        shouldSendSms: withSms,
        logPrefix: 'reservation confirmed notification',
    })
}

export const handleConfirmationRequest = async ({
    reservationId,
    withSms,
    withEmail,
}: NotificationHandlerParams) => {
    const reservationMessageInstance = await ReservationEntities.geTReservationMessageInstance({
        reservationId
    })

    const guest = reservationMessageInstance.guest
    const email = guest.isContactAssistant ? guest.assistantEmail : guest.email
    const phone = guest.isContactAssistant ? guest.assistantPhone : guest.phone

    if (withSms && !phone) {
        // toastOptions.setToast('Phone not set')
    }

    if (withEmail && !email) {
        // toastOptions.setToast('Email not set')
    }

    const emailMessage = withEmail ? await NotificationEntities.generateConfirmationNotification({
        reservation: reservationMessageInstance,
        type: EnumNotificationType.EMAIL
    }) : ''

    const smsMessage = withSms ? await NotificationEntities.generateConfirmationNotification({
        reservation: reservationMessageInstance,
        type: EnumNotificationType.SMS
    }) : ''

    await handleNotificationSending({
        reservation: reservationMessageInstance,
        notificationType: EnumNotificationMessageType.ReservationConfirmationRequest,
        notificationMessageTypeId: EnumNotificationMessageTypeNumeric[EnumNotificationMessageType.ReservationConfirmationRequest],
        emailMessage,
        smsMessage,
        shouldSendEmail: withEmail,
        shouldSendSms: withSms,
        logPrefix: 'confirmation request notification',
    })
}

export const handleConfirmationRequestCancelled = async ({
    reservationId,
    withSms,
    withEmail,
}: NotificationHandlerParams) => {

}


export const handleNotifyPrepayment = async ({
    reservationId,
    withSms,
    withEmail,
}: NotificationHandlerParams) => {
    const reservationMessageInstance = await ReservationEntities.geTReservationMessageInstance({
        reservationId
    })

    const guest = reservationMessageInstance.guest
    const email = guest.isContactAssistant ? guest.assistantEmail : guest.email
    const phone = guest.isContactAssistant ? guest.assistantPhone : guest.phone

    if (withSms && !phone) {
        // toastOptions.setToast('Phone not set')
    }

    if (withEmail && !email) {
        // toastOptions.setToast('Email not set')
    }

    const emailMessage = withEmail ? await NotificationEntities.generateNotifyPrePaymentNotification({
        reservation: reservationMessageInstance,
        type: EnumNotificationType.EMAIL
    }) : ''

    const smsMessage = withSms ? await NotificationEntities.generateNotifyPrePaymentNotification({
        reservation: reservationMessageInstance,
        type: EnumNotificationType.SMS
    }) : ''

    await handleNotificationSending({
        reservation: reservationMessageInstance,
        notificationType: EnumNotificationMessageType.NotifiedForPrepayment,
        notificationMessageTypeId: EnumNotificationMessageTypeNumeric[EnumNotificationMessageType.NotifiedForPrepayment],
        emailMessage,
        smsMessage,
        shouldSendEmail: withEmail,
        shouldSendSms: withSms,
        logPrefix: 'notify prepayment notification',
    })
}

export const handleReservationGuestCountChange = async ({
    reservationId,
    oldValue,
    newValue,
    withSms,
    withEmail,
}: NotificationHandlerParams & {
    oldValue: string,
    newValue: string
}) => {
    const reservationMessageInstance = await ReservationEntities.geTReservationMessageInstance({
        reservationId
    })

    const emailMessage = withEmail ? await NotificationEntities.generateReservationGuestCountChange({
        reservation: reservationMessageInstance,
        oldGuestCount: oldValue,
        newGuestCount: newValue,
        type: EnumNotificationType.EMAIL
    }) : ''

    const smsMessage = withSms ? await NotificationEntities.generateReservationGuestCountChange({
        reservation: reservationMessageInstance,
        oldGuestCount: oldValue,
        newGuestCount: newValue,
        type: EnumNotificationType.SMS
    }) : ''

    await handleNotificationSending({
        reservation: reservationMessageInstance,
        notificationType: EnumNotificationMessageType.ReservationGuestCountChange,
        notificationMessageTypeId: EnumNotificationMessageTypeNumeric[EnumNotificationMessageType.ReservationGuestCountChange],
        emailMessage,
        smsMessage,
        shouldSendEmail: withEmail,
        shouldSendSms: withSms,
        logPrefix: 'reservation guest count change notification',
    })
}

export const handleReservationTimeChange = async ({
    reservationId,
    oldValue,
    newValue,
    withSms,
    withEmail,
}: NotificationHandlerParams & { oldValue: string, newValue: string }) => {

    const reservationMessageInstance = await ReservationEntities.geTReservationMessageInstance({
        reservationId
    })

    const emailMessage = withEmail ? await NotificationEntities.generateReservationTimeChange({
        reservation: reservationMessageInstance,
        oldTime: oldValue,
        newTime: newValue,
        type: EnumNotificationType.EMAIL
    }) : ''

    const smsMessage = withSms ? await NotificationEntities.generateReservationTimeChange({
        reservation: reservationMessageInstance,
        oldTime: oldValue,
        newTime: newValue,
        type: EnumNotificationType.SMS
    }) : ''

    await handleNotificationSending({
        reservation: reservationMessageInstance,
        notificationType: EnumNotificationMessageType.ReservationTimeChange,
        notificationMessageTypeId: EnumNotificationMessageTypeNumeric[EnumNotificationMessageType.ReservationTimeChange],
        emailMessage,
        smsMessage,
        shouldSendEmail: withEmail,
        shouldSendSms: withSms,
        logPrefix: 'reservation time change notification',
    })
}



export const handleCreatedReservationFromWaitlist = async ({
    waitlistId,
    withSms,
    withEmail,
}: WaitlistNotificationHandlerParams) => {
    const waitlistWithGuest = await waitlistEntities.getWaitlistMessageInstance({
        waitlistId
    })

    const emailMessage = withEmail ? await NotificationEntities.generateCreatedReservationFromWaitlistNotification({
        waitlist: waitlistWithGuest,
        type: EnumNotificationType.EMAIL
    }) : ''

    const smsMessage = withSms ? await NotificationEntities.generateCreatedReservationFromWaitlistNotification({
        waitlist: waitlistWithGuest,
        type: EnumNotificationType.SMS
    }) : ''

    await handleWaitlistNotificationSending({
        waitlist: waitlistWithGuest,
        notificationType: EnumWaitlistNotificationMessageType.CreatedReservationFromWaitlist,
        emailMessage,
        smsMessage,
        shouldSendEmail: withEmail,
        shouldSendSms: withSms,
        logPrefix: 'created reservation from waitlist notification',
    })
}


export const handleAddedToWaitlist = async ({
    waitlistId,
    withSms,
    withEmail,
}: WaitlistNotificationHandlerParams) => {
    const waitlistWithGuest = await waitlistEntities.getWaitlistMessageInstance({
        waitlistId
    })

    const emailMessage = withEmail ? await NotificationEntities.generateAddedToWaitlistNotification({
        waitlist: waitlistWithGuest,
        type: EnumNotificationType.EMAIL
    }) : ''

    const smsMessage = withSms ? await NotificationEntities.generateAddedToWaitlistNotification({
        waitlist: waitlistWithGuest,
        type: EnumNotificationType.SMS
    }) : ''

    await handleWaitlistNotificationSending({
        waitlist: waitlistWithGuest,
        notificationType: EnumWaitlistNotificationMessageType.AddedToWaitlist,
        emailMessage,
        smsMessage,
        shouldSendEmail: withEmail,
        shouldSendSms: withSms,
        logPrefix: 'added to waitlist notification',
    })
}

export const handleCancelWaitlist = async ({
    waitlistId,
    withSms,
    withEmail,
}: WaitlistNotificationHandlerParams) => {
    const waitlistWithGuest = await waitlistEntities.getWaitlistMessageInstance({
        waitlistId
    })

    const emailMessage = withEmail ? await NotificationEntities.generateCancelWaitlistNotification({
        waitlist: waitlistWithGuest,
        type: EnumNotificationType.EMAIL
    }) : ''

    const smsMessage = withSms ? await NotificationEntities.generateCancelWaitlistNotification({
        waitlist: waitlistWithGuest,
        type: EnumNotificationType.SMS
    }) : ''

    await handleWaitlistNotificationSending({
        waitlist: waitlistWithGuest,
        notificationType: EnumWaitlistNotificationMessageType.CancelWaitlist,
        emailMessage,
        smsMessage,
        shouldSendEmail: withEmail,
        shouldSendSms: withSms,
        logPrefix: 'cancel waitlist notification',
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
    handlePrepaymentCancelled,

    //waitlist
    handleCreatedReservationFromWaitlist,
}