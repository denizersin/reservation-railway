import { getEnumValues } from '@/server/utils/server-utils';
import { EnumUserRole } from '@/shared/enums/predefined-enums';
import { z } from 'zod';

// Register Validator
const registerSchema = z.object({
    name: z.string().max(256, "Name cannot exceed 256 characters").optional(),

    email: z.string().email("Invalid email address").max(256, "Email cannot exceed 256 characters"),
    password: z.string().min(4, "Password must be at least 8 characters long").max(256, "Password cannot exceed 256 characters"),
    role: z.enum(getEnumValues(EnumUserRole)).default(EnumUserRole.user), // Default role as 'user'
});


// Login Validator
const loginSchema = z.object({
    email: z.string().email("Invalid email address").max(256, "Email cannot exceed 256 characters"),
    password: z.string().min(4, "Password must be at least 8 characters long").max(256, "Password cannot exceed 256 characters"),
});

const updateUserByAdminSchema= z.object({
    name: z.string().optional(),

    id: z.number().int().positive(),
    email: z.string(),
    password: z.string(),
    role: z.enum(getEnumValues(EnumUserRole)), 

})


export const getAllUsersValidatorSchema = z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    name: z.string().optional(),
    email: z.string().optional(),
    role: z.enum(['user', 'admin']).optional()
})


export const userValidator = {
    registerSchema,
    loginSchema,
    updateUserByAdminSchema,
    getAllUsersValidatorSchema

}



namespace TUserValidator{
    export type registerSchema = z.infer<typeof registerSchema>
    export type loginSchema = z.infer<typeof loginSchema>
    export type updateUserByAdminSchema = z.infer<typeof updateUserByAdminSchema>
    export type getAllUsersValidatorSchema = z.infer<typeof getAllUsersValidatorSchema>
}

export default TUserValidator


