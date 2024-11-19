import { z } from "zod";

const monthAvailabilityQuerySchema = z.object({
    mealId: z.number().int().positive(),
    month: z.number().int().positive(),
})


const avaliableHoursByDateQuerySchema = z.object({
    date: z.string(),
    mealId: z.number().int().positive(),
})




export const clientQueryValidator = {
    monthAvailabilityQuerySchema,
    avaliableHoursByDateQuerySchema,
}

namespace TClientQueryValidator {
    export type TMonthAvailabilityQuery = z.infer<typeof monthAvailabilityQuerySchema>
    export type TAvaliableHoursByDateQuery = z.infer<typeof avaliableHoursByDateQuerySchema>
}

export default TClientQueryValidator