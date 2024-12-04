import { paymentSettingEntities } from "@/server/layer/entities/restaurant-setting";
import { TUnpaidReservationRecord } from "../queries/reservation";
import { TRestaurantPaymentSettingSelect } from "@/server/db/schema";
import { JobType } from "../config";
import { env } from "@/env";

export const getUnpaidReservationJob = async ({ record, restaurantPaymentSetting }: {
    record: TUnpaidReservationRecord
    restaurantPaymentSetting?: TRestaurantPaymentSettingSelect
}): Promise<JobType> => {

    const { reservation, restaurant } = record;
    const paymentJobId = `${reservation.id}-payment_check`;

    let paymentSetting = restaurantPaymentSetting;
    if (!paymentSetting) {
        paymentSetting = await paymentSettingEntities.getRestaurantPaymentSetting({ restaurantId: restaurant.id });
    }

    const paymentDeadlineHours = paymentSetting.prepaymentCancellationHours
    let prepaymentDeadline = new Date(reservation.createdAt.getTime() + paymentDeadlineHours * 60 * 60 * 1000)


    const nowTest = new Date()
    let test = new Date(nowTest.getTime() + 1000 * 60 * 5)

    prepaymentDeadline = env.NODE_ENV === "development" ? test : prepaymentDeadline

    const now = new Date()
    // const isDeadlinePassed = prepaymentDeadline < now

    return {
        id: paymentJobId,
        type: 'payment_check',
        // executeAt: isDeadlinePassed ? now : prepaymentDeadline,
        executeAt: prepaymentDeadline,
        data: {
            reservationId: reservation.id,
            restaurantId: restaurant.id,
            deadlineHours: paymentDeadlineHours
        }
    }
}