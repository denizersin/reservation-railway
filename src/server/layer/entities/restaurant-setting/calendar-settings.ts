import { tblRestaurantCalendarSetting, TRestaurantCalendarSetting, TRestaurantCalendarSettingInsert } from "@/server/db/schema"
import { restaurantEntities } from "../restaurant"
import { db } from "@/server/db"
import { eq } from "drizzle-orm"
import TRestaurantCalendarSettingValidator from "@/shared/validators/restaurant-setting/calendar"

export const getCalendarSetting = async ({
    restaurantId
}: {
    restaurantId: number
}) => {

    const restaurant = await restaurantEntities.getRestaurantById({ restaurantId })

    const calendarSetting = await db.query.tblRestaurantCalendarSetting.findFirst({ where: eq(tblRestaurantCalendarSetting.id, restaurant.restaurantCalendarSettingId) })

    if (!calendarSetting) throw new Error('Calendar setting not found')

    return calendarSetting
}


export const updateCalendarSetting = async ({
    calendarSettingId,
    calendarSetting
}: TRestaurantCalendarSettingValidator.TUpdateCalendarSetting) => {

    const updatedCalendarSetting = await db.update(tblRestaurantCalendarSetting).set({
        closedMonths: calendarSetting.closedMonths,
        maxAdvanceBookingDays: calendarSetting.maxAdvanceBookingDays
    }).where(eq(tblRestaurantCalendarSetting.id, calendarSettingId))

    return updatedCalendarSetting
}