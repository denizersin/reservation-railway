import { z } from "zod";

//pagination
export const getAllRestaurantTagsSchema = z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    languageId: z.number().int().positive(),
    name: z.string().optional()
})

export const createRestaurantTagSchema = z.object({
    name: z.string().max(256, "Name cannot exceed 256 characters"),
    languageId: z.number().int().positive()
})

const translationSchema = z.array(z.object({
    name: z.string().max(50, "Name cannot exceed 50 characters").min(3, "Name must be at least 3 characters"),
    code: z.string().max(10, "Code cannot exceed 10 characters").min(3, "Code must be at least 3 characters"),
    languageId: z.number().int().positive()
}))

export const createRestaurantFormSchema = z.object({
    translations: translationSchema
})

export const updateRestaurantTagSchema = z.object({
    id: z.number().int().positive(),
    translations: translationSchema
})


export const restaurantTagValidator = {
    getAllRestaurantTagsSchema,
    createRestaurantTagSchema,
    updateRestaurantTagSchema,
    createRestaurantFormSchema
}

namespace TRestaurantTagValidator {
    export type getAllRestaurantTagsSchema = z.infer<typeof getAllRestaurantTagsSchema>
    export type createRestaurantTagSchema = z.infer<typeof createRestaurantTagSchema>
    export type updateRestaurantTagSchema = z.infer<typeof updateRestaurantTagSchema>
    export type createRestaurantFormSchema = z.infer<typeof createRestaurantFormSchema>
}

export default TRestaurantTagValidator