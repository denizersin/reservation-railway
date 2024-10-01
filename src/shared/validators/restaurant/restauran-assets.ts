import { getEnumValues } from "@/server/utils/server-utils";
import { EnumDays } from "@/shared/enums/predefined-enums";
import { z } from "zod";

export const restaurantMealsCrudSchema = z.object({
    mealIds: z.array(z.number().int().positive())
})

export const restaurantMealDaysCrudSchema = z.object({
    mealDays: z.array(z.object({
        mealId: z.number(),
        day: z.enum(getEnumValues(EnumDays)),
        isOpen: z.boolean()
    }))
});

export const restaurantMealHoursAddSChema = z.object({
    mealHours: z.array(z.object({
        mealId: z.number(),
        hour: z.string().regex(/^\d{2}:\d{2}$/, {
            message: "Hour must be in the format HH:MM"
        }),
        isOpen: z.boolean().default(true)
    }))
})

export const restaurantMealHoursUpdateSchema = z.object({
    data: z.object({
        hour: z.string().regex(/^\d{2}:\d{2}$/, {
            message: "Hour must be in the format HH:MM"
        }).optional(),
        isOpen: z.boolean().default(true).optional(),
    }),
    mealHourId: z.number().int().positive()
})





export const restaurantAssetsValidator = {
    restaurantMealsCrudSchema,
    restaurantMealDaysCrudSchema,
    restaurantMealHoursAddSChema,
    restaurantMealHoursUpdateSchema
}




namespace TRestaurantAssetsValidator {
    export type restaurantMealsCrudSchema = z.infer<typeof restaurantMealsCrudSchema>
    export type restaurantMealDaysCrudSchema = z.infer<typeof restaurantMealDaysCrudSchema>
    export type restaurantMealHoursAddSChema = z.infer<typeof restaurantMealHoursAddSChema>
    export type restaurantMealHoursUpdateSchema = z.infer<typeof restaurantMealHoursUpdateSchema>
}

export default TRestaurantAssetsValidator;