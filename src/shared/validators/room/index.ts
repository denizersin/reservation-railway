import { getEnumValues } from "@/server/utils/server-utils";
import { EnumTableShape } from "@/shared/enums/predefined-enums";
import { z } from "zod";

// Define a schema for room translations
const roomTranslationSchema = z.object({
    languageId: z.number(),
    name: z.string().min(1).max(255),
    description: z.string().nullable(),
});

// Schema for creating a room
export const createRoomSchema = z.object({
    isWaitingRoom: z.boolean().default(false),
    order: z.number().int().positive(),
    translations: z.array(roomTranslationSchema).min(1),
});

// Schema for updating a room
export const updateRoomSchema = z.object({
    roomId: z.number().int().positive(),
    data: createRoomSchema
});


//Tables
export const createRoomTableFormSchema = z.object({
    tableCount: z.number().int().positive(),
    orderStartAt: z.number().int().positive(),
    tableNumberStartAt: z.number().int().positive(),
    startLetter: z.string().min(1).max(255).optional().nullable(),
    endLetter: z.string().min(1).max(255).optional().nullable(),

    capacity: z.number().int().positive(),
    minCapacity: z.number().int().positive(),
    maxCapacity: z.number().int().positive(),
    shape:z.enum(getEnumValues(EnumTableShape)).default(EnumTableShape.square),
})

export const createRoomTableSchema= z.object({
    roomId: z.number().int().positive(),
    data: createRoomTableFormSchema,
})


export const updateRoomTableFormSchema = z.object({
    order: z.number().int().positive().optional(),
    no: z.string().min(1).max(255).optional(),
    capacity: z.number().int().positive().optional(),
    minCapacity: z.number().int().positive().optional(),
    maxCapacity: z.number().int().positive().optional(),
    shape:z.enum(getEnumValues(EnumTableShape)).default(EnumTableShape.square).optional(),
    isActive: z.boolean().optional(),
})

export const updateRoomTableSchema= z.object({
    tableId: z.number().int().positive(),
    data: updateRoomTableFormSchema,
})


export const roomValidator = {
    createRoomSchema,
    updateRoomSchema,



    createRoomTableFormSchema,
    createRoomTableSchema,
    updateRoomTableSchema,
}

namespace TRoomValidator {
    export type createRoomSchema = z.infer<typeof createRoomSchema>
    export type updateRoomSchema = z.infer<typeof updateRoomSchema>

    export type createRoomTableFormSchema = z.infer<typeof createRoomTableFormSchema>
    export type createRoomTableSchema = z.infer<typeof createRoomTableSchema>
    export type updateRoomTableSchema = z.infer<typeof updateRoomTableSchema>
}

export default TRoomValidator