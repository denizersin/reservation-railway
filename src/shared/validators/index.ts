import { z } from "zod";

export const basePaginationSchema = z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive()
})


export type TBasePaginationSchema = z.infer<typeof basePaginationSchema>