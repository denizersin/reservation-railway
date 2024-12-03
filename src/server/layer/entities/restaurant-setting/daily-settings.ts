import { db } from "@/server/db"
import { tblRestaurantDailySettings } from "@/server/db/schema/restaurant-setting/daily-settings"
import { and, between, eq } from "drizzle-orm"
import { restaurantEntities } from "../restaurant"
import { getStartAndEndOfDay } from "@/server/utils/server-utils"
import TRestaurantDailySettingValidator, { TRestaurantDailySettingInsert, TRestaurantDailySettingSelect } from "@/shared/validators/restaurant-setting/daily"

export const getDailySettings = async ({ restaurantId, date }: { restaurantId: number, date: Date }) => {
    console.log( date,'date')
    const { start, end } = getStartAndEndOfDay({ date })
    console.log(start, end, 'start end')
    let dailySettings: TRestaurantDailySettingSelect | undefined = undefined
    dailySettings = await db.query.tblRestaurantDailySettings.findFirst({
        where: and(eq(tblRestaurantDailySettings.restaurantId, restaurantId),
            between(tblRestaurantDailySettings.date, date, date)
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