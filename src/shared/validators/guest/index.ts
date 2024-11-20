import { getEnumValues } from "@/server/utils/server-utils";
import { EnumGender, EnumVipLevel } from "@/shared/enums/predefined-enums";
import { z } from "zod";
import { basePaginationQuerySchema, basePaginationSchema } from "..";

export const createGuestSchema = z.object({
    languageId: z.number().int().positive(),
    countryId: z.number().int().positive(),

    name: z.string().max(256),
    surname: z.string().max(256),
    email: z.string().max(256),
    phone: z.string().max(256),
    phoneCode: z.string().max(256),

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
    phoneCode: z.string().max(256),
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

export const getAllGuestsSchema = z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    name: z.string().optional().nullable(),
    email: z.string().optional().nullable(),
})

export const guestsPaginationSchema =
    basePaginationQuerySchema
        .extend({
            filters: z.object({
                name: z.string().optional(),
                surname: z.string().optional(),
                email: z.string().optional(),
                phone: z.string().optional(),
                companyId: z.number().int().optional(),
                countryId: z.number().int().optional(),
                languageId: z.number().int().optional(),
                vipLevel: z.enum(getEnumValues(EnumVipLevel)).optional(),
                isVip: z.boolean().optional(),
                isContactAssistant: z.boolean().optional(),
                guestId: z.number().int().optional(),
            })
        })


export const guestCompanyPaginationSchema = basePaginationQuerySchema


export const createGuestCompanySchema = z.object({
    companyName: z.string().max(256),
    phone: z.string().max(256).optional(),
    email: z.string().email().max(256).optional(),
})

export const updateGuestCompanySchema = z.object({
    id: z.number().int().positive(),
    data: createGuestCompanySchema.partial(),
})

export const deleteGuestCompanySchema = z.object({
    guestCompanyId: z.number().int().positive(),
})


export const guestValidator = {
    createGuestSchema,
    updateGuestSchema,
    getAllGuestsSchema,
    createGuestSchemaForm,
    guestsPaginationSchema,
    guestCompanyPaginationSchema,
    createGuestCompanySchema,
    updateGuestCompanySchema,
    deleteGuestCompanySchema
    
}





namespace TGuestValidator {
    export type CreateGuest = z.infer<typeof createGuestSchema>;
    export type UpdateGuest = z.infer<typeof updateGuestSchema>;
    export type getAllGuestsSchema = z.infer<typeof getAllGuestsSchema>;
    export type CreateGuestForm = z.infer<typeof createGuestSchemaForm>;
    export type GuestsPaginationSchema = z.infer<typeof guestsPaginationSchema>;
    export type GuestCompanyPaginationSchema = z.infer<typeof guestCompanyPaginationSchema>;
    export type CreateGuestCompanySchema = z.infer<typeof createGuestCompanySchema>;
    export type UpdateGuestCompanySchema = z.infer<typeof updateGuestCompanySchema>;
    export type DeleteGuestCompanySchema = z.infer<typeof deleteGuestCompanySchema>;
}

export default TGuestValidator;