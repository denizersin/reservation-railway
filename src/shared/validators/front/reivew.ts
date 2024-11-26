import { z } from "zod";


const makeReviewForm = z.object({
    ratings: z.array(z.object({
        rating: z.number().int().min(1).max(5),
        restaurantReviewId: z.number().int(),
    })),
    guestReview:z.string().optional()
})

const makeReview = z.object({
    reviewId: z.number().int().positive(),
    data: makeReviewForm,
})



export const clientReviewValidator = {
    makeReview,
    makeReviewForm
}

namespace TClientReviewValidator {
    export type TMakeReview = z.infer<typeof clientReviewValidator.makeReview>
    export type TMakeReviewForm = z.infer<typeof clientReviewValidator.makeReviewForm>
}

export default TClientReviewValidator