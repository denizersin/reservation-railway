import { tblRestaurantCalendarSetting } from "@/server/db/schema"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { z } from "zod"



const updateCalendarSettingFormSchema = createSelectSchema(tblRestaurantCalendarSetting, {
    closedMonths: z.array(z.number())
}).omit({
    id: true,
})

const updateCalendarSettingSchema = z.object({
    calendarSettingId: z.number().int().positive(),
    calendarSetting: updateCalendarSettingFormSchema.partial()
})



export const restaurantCalendarSettingValidator = {
    updateCalendarSettingSchema,
    updateCalendarSettingFormSchema
}

namespace TRestaurantCalendarSettingValidator {
    export type TUpdateCalendarSetting = z.infer<typeof updateCalendarSettingSchema>
    export type TUpdateCalendarSettingForm = z.infer<typeof updateCalendarSettingFormSchema>
}

export default TRestaurantCalendarSettingValidator
