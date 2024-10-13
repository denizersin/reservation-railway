import { z } from "zod";

// Base schema for the table
const basePersonelSchema = z.object({
    fullName: z.string().max(256), // Required field
    phone: z.string().max(256).nullable().optional(), // Nullable and optional field
    email: z.string().email().max(256).nullable().optional(), // Nullable and optional email field
    birthDate: z.date().nullable().optional(), // Nullable and optional date field
    specialId: z.string().max(256).nullable().optional(), // Nullable and optional field
});

// Create schema - omit 'id' if there is one
export const createPersonelSchema = basePersonelSchema

// Update schema - id is required, other fields are optional
export const updateSchema = z.object({
    id: z.number().int().positive(), // Required id
    data: createPersonelSchema.partial(), // Partial version of createPersonelSchema
});

export const deletePersonelSchema = z.object({
    id: z.number().int().positive(), // Required id
});


export const personelValidator = {
    createPersonelSchema,
    updateSchema,
    deletePersonelSchema
}

namespace TPersonelValidator {
    export type CreatePersonelSchema = z.infer<typeof createPersonelSchema>
    export type UpdatePersonelSchema = z.infer<typeof updateSchema>
    export type DeletePersonelSchema = z.infer<typeof deletePersonelSchema>
}

export default TPersonelValidator;