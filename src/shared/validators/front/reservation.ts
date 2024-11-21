import { z } from "zod";

const monthAvailabilityQuerySchema = z.object({
    mealId: z.number().int().positive(),
    month: z.number().int(),
})

const monthAvailabilityByGuestCountQuerySchema = z.object({
    mealId: z.number().int().positive(),
    month: z.number().int(),
    guestCount: z.number().int().positive(),
    monthDate: z.date(),
})


const avaliableHoursByDateQuerySchema = z.object({
    date: z.string(),
    mealId: z.number().int().positive(),
})




export const clientQueryValidator = {
    monthAvailabilityQuerySchema,
    monthAvailabilityByGuestCountQuerySchema,
    avaliableHoursByDateQuerySchema,

}

namespace TClientQueryValidator {
    export type TMonthAvailabilityQuery = z.infer<typeof monthAvailabilityQuerySchema>
    export type TMonthAvailabilityByGuestCountQuery = z.infer<typeof monthAvailabilityByGuestCountQuerySchema>
    export type TAvaliableHoursByDateQuery = z.infer<typeof avaliableHoursByDateQuerySchema>
}

export default TClientQueryValidator