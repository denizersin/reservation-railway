import { z } from "zod";

export const basePaginationSchema = z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive()
})

export const baseSortSchema = z.object({
    sortBy: z.enum(['asc', 'desc']).optional(),
    sortField: z.string().optional()
})

export const basePaginationQuerySchema = z.object({
    pagination: basePaginationSchema,
    sort: baseSortSchema.optional(),
    global_search: z.string().optional(),
})

export const baseNotificationOptionsSchema = z.object({
    withSms: z.boolean(),
    withEmail: z.boolean(),
})


export type TBasePaginationSchema = z.infer<typeof basePaginationSchema>
export type TBaseSortSchema = z.infer<typeof baseSortSchema>
export type TBasePaginationQuerySchema = z.infer<typeof basePaginationQuerySchema>