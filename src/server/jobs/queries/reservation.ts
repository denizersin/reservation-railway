import { db } from "@/server/db";
import { tblReservation } from "@/server/db/schema/reservation";
import { getLocalTime, getStartAndEndOfDay } from "@/server/utils/server-utils";
import { EnumNotificationMessageTypeNumeric, EnumNotificationStatus, EnumReservationStatusNumeric } from "@/shared/enums/predefined-enums";
import { and, between, eq, gt } from "drizzle-orm";

import { tblGuest, tblReservationNotification, tblRestaurant, tblRestaurantPaymentSetting, TRestaurantPaymentSettingSelect } from "@/server/db/schema";

export type TUnpaidReservationRecord = Awaited<ReturnType<typeof getUnpaidReservations>>['reservations'][number]

export const getUnpaidReservations = async ({
    date,
    lastProcessedId = 0,
    pageSize = 100
}: {
    date: Date;
    lastProcessedId?: number;
    pageSize?: number;
}) => {
    const { start, end } = getStartAndEndOfDay({ date: getLocalTime(date) });

    const result = await db.select()
        .from(tblRestaurant)
        .leftJoin(tblReservation, eq(tblReservation.restaurantId, tblRestaurant.id))
        .leftJoin(tblGuest, eq(tblReservation.guestId, tblGuest.id))
        .leftJoin(tblReservationNotification,
            and(
                eq(tblReservation.id, tblReservationNotification.reservationId),
                eq(tblReservationNotification.notificationMessageTypeId, EnumNotificationMessageTypeNumeric["Notified For Prepayment"]),
                eq(tblReservationNotification.status, EnumNotificationStatus.SENT)
            )
        )
        .where(and(
            between(tblReservation.reservationDate, start, end),
            eq(tblReservation.reservationStatusId, EnumReservationStatusNumeric.prepayment),
            eq(tblReservation.isSendEmail, true),
            eq(tblReservation.isSendSms, true),
            eq(tblReservation.isCreatedByOwner, false),
            gt(tblReservation.id, lastProcessedId),
        ))
        .limit(pageSize)
        .orderBy(tblReservation.id);

    type Result = (typeof result)[number];

    type NonNullableResult = Result & {
        reservation: NonNullable<Result['reservation']>,
        guest: NonNullable<Result['guest']>,
        restaurant: NonNullable<Result['restaurant']>,

    }

    return {
        reservations: result as NonNullableResult[],
        lastProcessedId: (result.length > 0 ? result?.[result.length - 1]?.reservation?.id : lastProcessedId || 0   ) as number,
        hasMore: result.length === pageSize
    };
};


export const getUnpaidReservationById = async ({
    reservationId,
}: {
    reservationId: number;
}) => {
    const result = await db.select()
        .from(tblRestaurant)
        .leftJoin(tblReservation, eq(tblReservation.restaurantId, tblRestaurant.id))
        .leftJoin(tblGuest, eq(tblReservation.guestId, tblGuest.id))
        .leftJoin(tblReservationNotification,
            and(
                eq(tblReservation.id, tblReservationNotification.reservationId),
                eq(tblReservationNotification.notificationMessageTypeId, EnumNotificationMessageTypeNumeric["Notified For Prepayment"]),
                eq(tblReservationNotification.status, EnumNotificationStatus.SENT)
            )
        )
        .where(and(
            eq(tblReservation.id, reservationId),
            eq(tblReservation.reservationStatusId, EnumReservationStatusNumeric.prepayment),
            eq(tblReservation.isSendEmail, true),
            eq(tblReservation.isSendSms, true),
            eq(tblReservation.isCreatedByOwner, false),

        ))

    type Result = (typeof result)[number];

    type NonNullableResult = Result & {
        reservation: NonNullable<Result['reservation']>,
        guest: NonNullable<Result['guest']>,
        restaurant: NonNullable<Result['restaurant']>,

    }


    return {
        reservation: result[0] as NonNullableResult | null,
    };
};


export const getRestaurantPrepaymentSettingMap = async () => {
    const result = await db.select().from(tblRestaurant)
        .leftJoin(tblRestaurantPaymentSetting, eq(tblRestaurant.paymentSettingId, tblRestaurantPaymentSetting.id))

    const map = new Map<number, TRestaurantPaymentSettingSelect>()

    for (const item of result) {
        map.set(item.restaurant.id, item.restaurant_payment_setting!)
    }

    return map
}