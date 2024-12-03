import { tblRestaurantDailySettings } from "@/server/db/schema/restaurant-setting/daily-settings"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { z } from "zod"

const updateDailySettingFormSchema = createSelectSchema(tblRestaurantDailySettings, {
    closedDinnerHours: z.array(z.string()),
    closedAreas: z.array(z.number()),
}).omit({
    id: true,
    date: true,
    restaurantId: true
})



const updateDailySettingSchema = z.object({
    dailySettingId: z.number().int().positive(),
    dailySetting: updateDailySettingFormSchema.partial()
})

export const restaurantDailySettingValidator = {
    updateDailySettingSchema,
    updateDailySettingFormSchema
}

namespace TRestaurantDailySettingValidator {
    export type TUpdateDailySetting = z.infer<typeof updateDailySettingSchema>
    export type TUpdateDailySettingForm = z.infer<typeof updateDailySettingFormSchema>
}

export default TRestaurantDailySettingValidator


export type TRestaurantDailySettingInsert = typeof tblRestaurantDailySettings.$inferInsert
export type TRestaurantDailySettingSelect = typeof tblRestaurantDailySettings.$inferSelect