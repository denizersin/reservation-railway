import { z } from "zod";
import { basePaginationQuerySchema, baseSortSchema } from "..";
import { TReservationReview } from "@/server/db/schema";



type TKeys = (keyof Pick<TReservationReview, 'reviewedAt'>)

const reviewPaginationSortFields: TKeys[] = ['reviewedAt'] 





 const sortSchema = baseSortSchema.extend({
    sortField: z.enum(reviewPaginationSortFields as [TKeys, ...TKeys[]])
})

const reviewPaginationQuerySchema = basePaginationQuerySchema.extend({
    filters: z.object({
        date: z.date().optional()
    }),
    sort: sortSchema.optional()
})


export const reviewValidator = {
    reviewPaginationQuerySchema,
    reviewPaginationSortFields
}

namespace TReviewValidator {
    export type TReviewPaginationQuerySchema = z.infer<typeof reviewPaginationQuerySchema>
}

export default TReviewValidator 