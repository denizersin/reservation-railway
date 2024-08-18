import { z } from 'zod';

// Register Validator
const registerSchema = z.object({
    name: z.string().min(1, "Name is required").max(256, "Name cannot exceed 256 characters"),
    email: z.string().email("Invalid email address").max(256, "Email cannot exceed 256 characters"),
    password: z.string().min(8, "Password must be at least 8 characters long").max(256, "Password cannot exceed 256 characters"),
    role: z.enum(['admin', 'user']).default('user'), // Default role as 'user'
});


// Login Validator
const loginSchema = z.object({
    email: z.string().email("Invalid email address").max(256, "Email cannot exceed 256 characters"),
    password: z.string().min(8, "Password must be at least 8 characters long").max(256, "Password cannot exceed 256 characters"),
});

export const userValidator = {
    registerSchema,
    loginSchema
}



namespace TUserValidator{
    export type LoginInput = z.infer<typeof userValidator.loginSchema>
    export type RegisterInput = z.infer<typeof userValidator.registerSchema>
}

export default TUserValidator


