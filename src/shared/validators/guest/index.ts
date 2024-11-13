import { getEnumValues } from "@/server/utils/server-utils";
import { EnumGender, EnumVipLevel } from "@/shared/enums/predefined-enums";
import { z } from "zod";

export const createGuestSchema = z.object({
    languageId: z.number().int().positive(),
    countryId: z.number().int().positive(),

    name: z.string().max(256),
    surname: z.string().max(256),
    email: z.string().max(256),
    phone: z.string().max(256),
    stablePhone: z.string().max(256).nullable().optional(),
    gender: z.enum(getEnumValues(EnumGender)),
    birthDate: z.date(),
    anniversaryDate: z.date().nullable().optional(),
    description: z.string().max(256).nullable().optional(),

    // Assistant information
    assistantName: z.string().max(256).nullable().optional(),
    assistantPhone: z.string().max(256).nullable().optional(),
    assistantEmail: z.string().max(256).nullable().optional(),

    isContactAssistant: z.boolean().default(false),

    // Company information
    companyId: z.number().int().nullable().optional(),
    position: z.string().max(256).nullable().optional(),
    department: z.string().max(256).nullable().optional(),

    // VIP information
    isVip: z.boolean(),
    vipLevel: z.enum(getEnumValues(EnumVipLevel)),

    // Notification information
    isSendSmsAndEmail: z.boolean(),
    isSendConfirmationNotifs: z.boolean(),
    isClaimProvision: z.boolean(),
    isSendReviewNotifs: z.boolean(),

    tagIds: z.array(z.number().int().positive()),

})


export const createGuestSchemaForm = z.object({
    languageId: z.number().int().positive(),
    countryId: z.number().int().positive(),

    name: z.string().max(256),
    surname: z.string().max(256),
    email: z.string().max(256),
    phone: z.string().max(256),
    stablePhone: z.string().max(256).nullable().optional(),
    gender: z.enum(getEnumValues(EnumGender)),
    birthDate: z.date(),
    anniversaryDate: z.date().nullable().optional(),
    description: z.string().max(256).nullable().optional(),

    // Assistant information
    assistantName: z.string().max(256).nullable().optional(),
    assistantPhone: z.string().min(1).max(256).nullable().optional(),
    assistantEmail: z.string().email().max(256).nullable().optional(),

    isContactAssistant: z.boolean().default(false),

    // Company information
    companyId: z.number().int().nullable().optional(),
    position: z.string().max(256).nullable().optional(),
    department: z.string().max(256).nullable().optional(),

    // VIP information
    isVip: z.boolean(),
    vipLevel: z.enum(getEnumValues(EnumVipLevel)),

    // Notification information
    isSendSmsAndEmail: z.boolean(),
    isSendConfirmationNotifs: z.boolean(),
    isClaimProvision: z.boolean(),
    isSendReviewNotifs: z.boolean(),

    tagIds: z.array(z.number().int().positive()),

}).refine(data => {
    console.log('3231')
    const { isContactAssistant, assistantPhone, assistantEmail } = data
    const hasEmailOrPhone = assistantPhone || assistantEmail
    return isContactAssistant ? hasEmailOrPhone : true
}, {
    message: 'Assistant phone or email are required if isContactAssistant is true',
    path: ['isContactAssistant']
})


export const updateGuestSchema = z.object({
    id: z.number().int().positive(),
    data: createGuestSchema.partial(),
});

export const getAllGuestsValidatorSchema = z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    name: z.string().optional().nullable(),
    email: z.string().optional().nullable(),
})



export const guestValidator = {
    createGuestSchema,
    updateGuestSchema,
    getAllGuestsValidatorSchema,
    createGuestSchemaForm
}





namespace TGuestValidator {
    export type CreateGuest = z.infer<typeof createGuestSchema>;
    export type UpdateGuest = z.infer<typeof updateGuestSchema>;
    export type getAllGuestsValidatorSchema = z.infer<typeof getAllGuestsValidatorSchema>;
    export type CreateGuestForm = z.infer<typeof createGuestSchemaForm>;
}

export default TGuestValidator;