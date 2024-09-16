import { getEnumValues } from '@/server/utils/server-utils';
import { EnumUserRole } from '@/shared/enums/predefined-enums';
import { z } from 'zod';

// Register Validator
const registerSchema = z.object({
    name: z.string().min(1, "Name is required").max(256, "Name cannot exceed 256 characters"),
    email: z.string().email("Invalid email address").max(256, "Email cannot exceed 256 characters"),
    password: z.string().min(4, "Password must be at least 8 characters long").max(256, "Password cannot exceed 256 characters"),
    role: z.enum(getEnumValues(EnumUserRole)).default(EnumUserRole.user), // Default role as 'user'
});


// Login Validator
const loginSchema = z.object({
    email: z.string().email("Invalid email address").max(256, "Email cannot exceed 256 characters"),
    password: z.string().min(4, "Password must be at least 8 characters long").max(256, "Password cannot exceed 256 characters"),
});

const updateUserByAdmin= z.object({
    id: z.number().int().positive(),
    name: z.string().optional(),
    email: z.string().optional(),
    password: z.string().optional(),
    role: z.enum(getEnumValues(EnumUserRole)).optional(), 

})


export const getAllUsersValidator = z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    name: z.string().optional(),
    email: z.string().optional(),
    role: z.enum(['user', 'admin']).optional()
})


export const userValidator = {
    registerSchema,
    loginSchema,
    getAllUsersValidator,
    updateUserByAdmin
}



namespace TUserValidator{
    export type LoginInput = z.infer<typeof userValidator.loginSchema>
    export type RegisterInput = z.infer<typeof userValidator.registerSchema>
    export type GetAllUsersInput = z.infer<typeof userValidator.getAllUsersValidator>
    export type UpdateUserByAdminInput = z.infer<typeof userValidator.updateUserByAdmin>
}

export default TUserValidator


