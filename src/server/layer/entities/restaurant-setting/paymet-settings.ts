import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { tblRestaurantPaymentSetting, TRestaurantPaymentSettingInsert, TRestaurantPaymentSettingSelect } from "@/server/db/schema"
import { restaurantEntities } from "../restaurant"

export const calculatePrepaymentAmount = async ({
    guestCount,
    prePaymentPricePerGuest
}: {
    guestCount: number,
    prePaymentPricePerGuest: number
}) => {
    return guestCount * prePaymentPricePerGuest
}


//get restaurant payment setting
export const getRestaurantPaymentSetting = async ({
    restaurantId
}: {
    restaurantId: number
}) => {

    const restaurant = await restaurantEntities.getRestaurantById({ restaurantId })

    const restaurantPaymentSetting = await db.query.tblRestaurantPaymentSetting.findFirst({ where: eq(tblRestaurantPaymentSetting.id, restaurant.paymentSettingId) })

    if (!restaurantPaymentSetting) throw new Error('Restaurant Payment Setting not found')

    return restaurantPaymentSetting
}

//update restaurant payment setting
export const updateRestaurantPaymentSetting = async ({
    paymentSettingId,
    data
}: {
    paymentSettingId: number,
    data: Partial<TRestaurantPaymentSettingSelect>
}) => {
    return await db.update(tblRestaurantPaymentSetting).set(data).where(eq(tblRestaurantPaymentSetting.id, paymentSettingId))
}


