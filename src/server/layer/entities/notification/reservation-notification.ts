import { db } from "@/server/db";
import { tblPrepaymentMessage, TGuestSelect, TReservation, TRestaurantWithoutTrns, TWaitlist } from "@/server/db/schema";
import { tblReservationNotification, tblWaitlistNotification, TReservationNotification, TReservationNotificationInsert, TWaitlistNotificationInsert } from "@/server/db/schema/reservation/notification";
import { reservationLinks } from "@/server/utils/front-link";
import { EnumLanguage, EnumNotificationType } from "@/shared/enums/predefined-enums";
import { and, eq } from "drizzle-orm";
import { LanguageEntity } from "../language";
import { languagesData } from "@/shared/data/predefined";
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
        Date: reservation.reservationDate.toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' }),
        Person: reservation.guestCount.toString(),
        Restaurant: reservation.restaurant.name
    }
}

export const getWaitlistBaseParams = (waitlist: TWaitlistMessageInstance) => {
    return {
        Client: waitlist.guest.name,
        Restaurant: waitlist.restaurant.name,
        Date: waitlist.waitlistDate.toISOString(),
        Person: waitlist.guestCount.toString(),
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

export const createWaitlistNotification = async (data: TWaitlistNotificationInsert) => {
    const [result] = await db.insert(tblWaitlistNotification).values(data).$returningId()
    const notification = await db.query.tblWaitlistNotification.findFirst({
        where: eq(tblWaitlistNotification.id, result?.id!)
    })
    if (!notification) throw new Error('Notification not created')
    return notification
};

function generateLink(type: EnumNotificationType, link: string): string {
    const emailLink = `<a href="${link}">${link}</a>`;
    return type === EnumNotificationType.EMAIL ? emailLink : link;
}

async function generateNotificationMessage({
    instance,
    type,
    message,
    linkType,
    linkParams,
    customParams = {}
}: {
    instance: TReservationMessageInstance | TWaitlistMessageInstance,
    type: EnumNotificationType,
    message: string,
    linkType?: keyof typeof reservationLinks,
    linkParams?: Record<string, any>,
    customParams?: MessageParams
}): Promise<string> {
    const baseParams = 'waitlistDate' in instance 
        ? getWaitlistBaseParams(instance as TWaitlistMessageInstance)
        : getBaseParams(instance as TReservationMessageInstance);

    const params: MessageParams = { ...baseParams, ...customParams };
    
    if (linkType && linkParams) {
        const link = generateLink(type, reservationLinks[linkType](linkParams as any));
        params.Link = link;
    }

    if (!message) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Message template not found' });
    }

    return parseMessage(message, params);
}

export const generateReservationCreatedNotification = async ({
    reservation,
    type
}: {
    reservation: TReservationMessageInstance,
    type: EnumNotificationType
}) => {
    const messages = await LanguageEntity.getReservationMessagesByLang({
        restaurantId: reservation.restaurantId,
        languageId: reservation.guest.languageId
    });

    return generateNotificationMessage({
        instance: reservation,
        type,
        message: messages.newReservationMessage,
        linkType: 'detail',
        linkParams: { reservationId: reservation.id }
    });
};

export const generateReservationCancelledNotification = async ({
    reservation,
    type
}: {
    reservation: TReservationMessageInstance,
    type: EnumNotificationType
}) => {
    const messages = await LanguageEntity.getReservationMessagesByLang({
        restaurantId: reservation.restaurantId,
        languageId: reservation.guest.languageId
    });

    return generateNotificationMessage({
        instance: reservation,
        type,
        message: messages.reservationCancellationMessage
    });
};

export const generateConfirmationNotification = async ({
    reservation,
    type
}: {
    reservation: TReservationMessageInstance,
    type: EnumNotificationType
}) => {
    const messages = await LanguageEntity.getReservationMessagesByLang({
        restaurantId: reservation.restaurantId,
        languageId: reservation.guest.languageId
    });

    return generateNotificationMessage({
        instance: reservation,
        type,
        message: messages.reservationConfirmationRequestMessage,
        linkType: 'status',
        linkParams: { reservationId: reservation.id }
    });
};

export const generateReservationConfirmedNotification = async ({
    reservation,
    type
}: {
    reservation: TReservationMessageInstance,
    type: EnumNotificationType
}) => {
    const messages = await LanguageEntity.getReservationMessagesByLang({
        restaurantId: reservation.restaurantId,
        languageId: reservation.guest.languageId
    });

    return generateNotificationMessage({
        instance: reservation,
        type,
        message: messages.reservationConfirmedMessage,
        linkType: 'status',
        linkParams: { reservationId: reservation.id }
    });
};

export const generatePrePaymentNotification = async ({
    reservation,
    type
}: {
    reservation: TReservationMessageInstance,
    type: EnumNotificationType
}) => {
    const messages = await LanguageEntity.getPrepaymentMessagesByLang({
        restaurantId: reservation.restaurantId,
        languageId: reservation.guest.languageId
    });

    return generateNotificationMessage({
        instance: reservation,
        type,
        message: messages.prepaymentMessage,
        linkType: 'prepayment',
        linkParams: { reservationId: reservation.id }
    });
};

export const generatePrePaymentCancelledNotification = async ({
    reservation,
    type
}: {
    reservation: TReservationMessageInstance,
    type: EnumNotificationType
}) => {
    const messages = await LanguageEntity.getPrepaymentMessagesByLang({
        restaurantId: reservation.restaurantId,
        languageId: reservation.guest.languageId
    });

    return generateNotificationMessage({
        instance: reservation,
        type,
        message: messages.prepaymentCancellationMessage,
        linkType: 'status',
        linkParams: { reservationId: reservation.id }
    });
};

export const generateNotifyPrePaymentNotification = async ({
    reservation,
    type
}: {
    reservation: TReservationMessageInstance,
    type: EnumNotificationType
}) => {
    const messages = await LanguageEntity.getPrepaymentMessagesByLang({
        restaurantId: reservation.restaurantId,
        languageId: reservation.guest.languageId
    });

    return generateNotificationMessage({
        instance: reservation,
        type,
        message: messages.prepaymentReminderMessage,
        linkType: 'status',
        linkParams: { reservationId: reservation.id }
    });
};

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
    const messages = await LanguageEntity.getReservationMessagesByLang({
        restaurantId: reservation.restaurantId,
        languageId: reservation.guest.languageId
    });

    return generateNotificationMessage({
        instance: reservation,
        type,
        message: messages.guestCountChangeMessage,
        linkType: 'status',
        linkParams: { reservationId: reservation.id },
        customParams: {
            OldCount: oldGuestCount,
            NewCount: newGuestCount
        }
    });
};

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
    const messages = await LanguageEntity.getReservationMessagesByLang({
        restaurantId: reservation.restaurantId,
        languageId: reservation.guest.languageId
    });

    return generateNotificationMessage({
        instance: reservation,
        type,
        message: messages.dateTimeChangeMessage,
        linkType: 'status',
        linkParams: { reservationId: reservation.id },
        customParams: {
            Date: newTime,
            OldTime: oldTime,
            NewTime: newTime
        }
    });
};

// Waitlist notifications
export const generateCreatedReservationFromWaitlistNotification = async ({
    waitlist,
    type
}: {
    waitlist: TWaitlistMessageInstance,
    type: EnumNotificationType
}) => {
    const messages = await LanguageEntity.getWaitlistMessagesByLang({
        restaurantId: waitlist.restaurantId,
        languageId: waitlist.guest.languageId
    });

    return generateNotificationMessage({
        instance: waitlist,
        type,
        message: messages.calledFromWaitlistMessage,
        linkType: 'waitlistStatus',
        linkParams: { waitlistId: waitlist.id }
    });
};

export const generateAddedToWaitlistNotification = async ({
    waitlist,
    type
}: {
    waitlist: TWaitlistMessageInstance,
    type: EnumNotificationType
}) => {
    const messages = await LanguageEntity.getWaitlistMessagesByLang({
        restaurantId: waitlist.restaurantId,
        languageId: waitlist.guest.languageId
    });

    return generateNotificationMessage({
        instance: waitlist,
        type,
        message: messages.addedToWaitlistMessage,
        linkType: 'waitlistStatus',
        linkParams: { waitlistId: waitlist.id }
    });
};

export const generateCancelWaitlistNotification = async ({
    waitlist,
    type
}: {
    waitlist: TWaitlistMessageInstance,
    type: EnumNotificationType
}) => {
    const messages = await LanguageEntity.getWaitlistMessagesByLang({
        restaurantId: waitlist.restaurantId,
        languageId: waitlist.guest.languageId
    });

    return generateNotificationMessage({
        instance: waitlist,
        type,
        message: messages.cancelWaitlistMessage,
        linkType: 'waitlistStatus',
        linkParams: { waitlistId: waitlist.id }
    });
};

export const NotificationEntities = {
    createReservationNotification,
    createWaitlistNotification,


    generateReservationCreatedNotification,
    generatePrePaymentNotification,
    generatePrePaymentCancelledNotification,
    
    generateReservationCancelledNotification,
    generateReservationConfirmedNotification,
    generateConfirmationNotification,
    generateNotifyPrePaymentNotification,
    generateReservationGuestCountChange,
    generateReservationTimeChange,

    //waitlist
    generateCreatedReservationFromWaitlistNotification,
    generateAddedToWaitlistNotification,
    generateCancelWaitlistNotification,
}



export type TReservationMessageInstance = TReservation & {
    guest: TGuestSelect
    restaurant: TRestaurantWithoutTrns
}

export type TWaitlistMessageInstance = TWaitlist & {
    guest: TGuestSelect,
    restaurant: TRestaurantWithoutTrns
}