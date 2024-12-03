import { db } from "@/server/db"
import { tblRestaurantDailySettings } from "@/server/db/schema/restaurant-setting/daily-settings"
import { and, between, eq } from "drizzle-orm"
import { restaurantEntities } from "../restaurant"
import { getLocalTime, getStartAndEndOfDay, utcHourToLocalHour } from "@/server/utils/server-utils"
import TRestaurantDailySettingValidator, { TRestaurantDailySettingInsert, TRestaurantDailySettingSelect } from "@/shared/validators/restaurant-setting/daily"

export const getDailySettings = async ({ restaurantId, date }: { restaurantId: number, date: Date }) => {
    const { start, end } = getStartAndEndOfDay({ date:getLocalTime(date) })
    let dailySettings: TRestaurantDailySettingSelect | undefined = undefined
    dailySettings = await db.query.tblRestaurantDailySettings.findFirst({
        where: and(eq(tblRestaurantDailySettings.restaurantId, restaurantId),
            between(tblRestaurantDailySettings.date, start, end)
        )
    })

    if (!dailySettings) {
        const createdDailySettingId = await createDailySettings({
            dailySetting: {
                restaurantId,
                date
            }
        })

        dailySettings = await db.query.tblRestaurantDailySettings.findFirst({
            where: and(eq(tblRestaurantDailySettings.restaurantId, restaurantId),
                eq(tblRestaurantDailySettings.id, createdDailySettingId)
            )
        })


    }

    if (!dailySettings) throw new Error('Daily settings not found')

    dailySettings.closedDinnerHours = dailySettings.closedDinnerHours.map(h => utcHourToLocalHour(h))

    return dailySettings
}


export const createDailySettings = async ({ dailySetting }: {
    dailySetting: TRestaurantDailySettingInsert
}) => {

    const [createdDailySetting] = await db.insert(tblRestaurantDailySettings).values(dailySetting).$returningId()

    return createdDailySetting?.id!
}

export const updateDailySettings = async ({ dailySettingId, dailySetting }: TRestaurantDailySettingValidator.TUpdateDailySetting) => {

    const updatedDailySetting = await db.update(tblRestaurantDailySettings).set({
        ...dailySetting
    }).where(eq(tblRestaurantDailySettings.id, dailySettingId))

    return updatedDailySetting
}