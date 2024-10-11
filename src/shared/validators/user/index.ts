import { getEnumValues } from '@/server/utils/server-utils';
import { EnumLanguage, EnumTheme, EnumUserRole } from '@/shared/enums/predefined-enums';
import { z } from 'zod';

// Register Validator
const registerSchema = z.object({
    name: z.string().max(256, "Name cannot exceed 256 characters").optional().nullable(),

    email: z.string().email("Invalid email address").max(256, "Email cannot exceed 256 characters"),
    password: z.string().min(4, "Password must be at least 8 characters long").max(256, "Password cannot exceed 256 characters"),
    role: z.enum(getEnumValues(EnumUserRole)).default(EnumUserRole.user), // Default role as 'user'
});


// Login Validator
const loginSchema = z.object({
    email: z.string().email("Invalid email address").max(256, "Email cannot exceed 256 characters"),
    password: z.string().min(4, "Password must be at least 8 characters long").max(256, "Password cannot exceed 256 characters"),
});

const updateUserByAdminSchema = z.object({
    name: z.string().optional().nullable(),

    id: z.number().int().positive(),
    email: z.string(),
    password: z.string(),
    role: z.enum(getEnumValues(EnumUserRole)),

})


export const getAllUsersValidatorSchema = z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    name: z.string().optional().nullable(),
    email: z.string().optional().nullable(),
    role: z.enum(getEnumValues(EnumUserRole)).optional().nullable()
})


export const updateUserPreferencesSchema = z.object({
    theme: z.enum(getEnumValues(EnumTheme)),
    language: z.enum(getEnumValues(EnumLanguage))
}).partial()


export const userValidator = {
    registerSchema,
    loginSchema,
    updateUserByAdminSchema,
    getAllUsersValidatorSchema,
    updateUserPreferencesSchema

}



namespace TUserValidator {
    export type registerSchema = z.infer<typeof registerSchema>
    export type loginSchema = z.infer<typeof loginSchema>
    export type updateUserByAdminSchema = z.infer<typeof updateUserByAdminSchema>
    export type getAllUsersValidatorSchema = z.infer<typeof getAllUsersValidatorSchema>
    export type updateUserPreferencesSchema = z.infer<typeof updateUserPreferencesSchema>
}

export default TUserValidator


