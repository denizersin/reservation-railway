import { reviewSettingsValidator } from "@/shared/validators/setting/review";
import { createTRPCRouter, ownerProcedure } from "../trpc";
import { reviewSettingEntities } from "@/server/layer/entities/restaurant-setting";
import { localHourToUtcHour } from "@/server/utils/server-utils";
import { z } from "zod";

export const restaurantSettingRouter = createTRPCRouter({
    updateReviewSettings: ownerProcedure
        .input(reviewSettingsValidator.updateReviewSettingsValidator)
        .mutation(async ({ input, ctx }) => {
            if (input.reviewSetting.reviewSendTime) {
                input.reviewSetting.reviewSendTime = localHourToUtcHour(input.reviewSetting.reviewSendTime)
            }
            await reviewSettingEntities.updateReviewSettings({
                reviewSettingId: input.reviewSettingId,
                reviewSetting: input.reviewSetting
            })
            return true
        }),
    getRestaurantReviewSettings: ownerProcedure
        .query(async ({ ctx }) => {
            return await reviewSettingEntities.getRestaurantReviewSettings({ restaurantId: ctx.restaurantId })
        }),
    updateReview: ownerProcedure
        .input(reviewSettingsValidator.updateReviewValidator)
        .mutation(async ({ input, ctx }) => {
            await reviewSettingEntities.updateReview({
                id: input.id,
                data: input.reviewData
            })
        }),
    deleteReview: ownerProcedure
        .input(z.object({ id: z.number().int().positive() }))
        .mutation(async ({ input, ctx }) => {
            await reviewSettingEntities.deleteReview({ id: input.id })
        }),
    getAllReviews: ownerProcedure
        .query(async ({ ctx }) => {
            return await reviewSettingEntities.getAllReviews({ restaurantId: ctx.restaurantId })
        }),
    createReview: ownerProcedure
        .input(reviewSettingsValidator.createReviewValidator)
        .mutation(async ({ input, ctx }) => {
            const restaurantId = ctx.restaurantId
            await reviewSettingEntities.createReview({ review: { ...input.review, restaurantId }, translations: input.translations })
        }),





});
