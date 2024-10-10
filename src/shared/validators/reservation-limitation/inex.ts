import { getEnumValues } from "@/server/utils/server-utils";
import { EnumDays } from "@/shared/enums/predefined-enums";
import { isValid, parseISO } from "date-fns";
import { z } from "zod";


export const createLimitationSchema = z.object({
    isActive: z.boolean().optional(),
    day: z.enum(getEnumValues(EnumDays)).nullable().optional(),
    mealId: z.number().int().positive(),
    roomId: z.number().int().nullable().optional(),
    hour: z.string(),
    maxTableCount: z.number().int().positive(),
    maxGuestCount: z.number().int().positive(),
})

export const updateLimitationSchema = z.object({
    limitationId: z.number().int().positive(),
    data: createLimitationSchema.partial(),
})


const isoDateValidator = z.string().refine((value) => {
    const parsedDate = parseISO(value);

    // Hem ISO formatında hem de geçerli bir tarih olup olmadığını kontrol et
    return isValid(parsedDate);
}, {
    message: "Not a valid ISO string date",
});


export const createPermanentLimitationSchema = z.object({
    roomId: z.number().int().nullable().optional(),
    startDate: z.date(),
    endDate: z.date(),
})





export const limitationValidator = {
    createLimitationSchema,
    updateLimitationSchema,
    createPermanentLimitationSchema
}




namespace TLimitationValidator {
    export type createLimitationSchema = z.infer<typeof createLimitationSchema>
    export type updateLimitationSchema = z.infer<typeof updateLimitationSchema>
    export type createPermanentLimitationSchema = z.infer<typeof createPermanentLimitationSchema>
}

export default TLimitationValidator;