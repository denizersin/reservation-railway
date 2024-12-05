import { calendarSettingEntities, paymentSettingEntities, restaurantGeneralSettingEntities, reviewSettingEntities, dailySettingEntities } from "@/server/layer/entities/restaurant-setting";
import { localHourToUtcHour, utcHourToLocalHour } from "@/server/utils/server-utils";
import { restaurantGeneralSettingValidator } from "@/shared/validators/restaurant-setting/general";
import { paymentSettingValidator } from "@/shared/validators/restaurant-setting/payment";
import { reviewSettingsValidator } from "@/shared/validators/restaurant-setting/review";
import { restaurantDailySettingValidator } from "@/shared/validators/restaurant-setting/daily";
import { z } from "zod";
import { createTRPCRouter, ownerProcedure } from "../trpc";
import { generalSettingUseCase } from "@/server/layer/use-cases/restaurant-setting";
import { restaurantCalendarSettingValidator } from "@/shared/validators/restaurant-setting/calendar";

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
            const reviewSettings = await reviewSettingEntities.getRestaurantReviewSettings({ restaurantId: ctx.restaurantId })
            reviewSettings.reviewSendTime = utcHourToLocalHour(reviewSettings.reviewSendTime) 
            return reviewSettings
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


    updateRestaurantGeneralSettings: ownerProcedure
        .input(restaurantGeneralSettingValidator.updateRestaurantGeneralSettingSchema)
        .mutation(async ({ input, ctx }) => {

            await generalSettingUseCase.updateRestaurantGeneralSetting({
                input,
                ctx
            })

            return true
        }),
    getRestaurantGeneralSettings: ownerProcedure
        .query(async ({ ctx }) => {
            const { user: { restaurantId } } = ctx.session
            console.log(restaurantId, 'ctx session restaurantId')
            const generalSettings = await restaurantGeneralSettingEntities.getGeneralSettings({ restaurantId: restaurantId! })
            return generalSettings
        }),
    getRestaurantPaymentSettings: ownerProcedure
        .query(async ({ ctx }) => {
            const { user: { restaurantId } } = ctx.session
            const paymentSettings = await paymentSettingEntities.getRestaurantPaymentSetting({ restaurantId: restaurantId! })
            return paymentSettings
        }),
    updateRestaurantPaymentSetting: ownerProcedure
        .input(paymentSettingValidator.updatePaymentSettingSchema)
        .mutation(async ({ input, ctx }) => {
            await paymentSettingEntities.updateRestaurantPaymentSetting({
                paymentSettingId: input.paymentSettingId,
                data: input.paymentSetting
            })
            return true
        }),

    getRestaurantGeneralSettingsToUpdate: ownerProcedure
        .query(async ({ ctx }) => {
            const { user: { restaurantId } } = ctx.session
            console.log(restaurantId, 'ctx session restaurantId')
            const generalSettings = await restaurantGeneralSettingEntities.getGeneralSettings({ restaurantId: restaurantId! })
            return generalSettings
        }),

    getRestaurantCalendarSettings: ownerProcedure
        .query(async ({ ctx }) => {
            const { user: { restaurantId } } = ctx.session
            const calendarSettings = await calendarSettingEntities.getCalendarSetting({ restaurantId: restaurantId! })
            return calendarSettings
        }),

    updateRestaurantCalendarSetting: ownerProcedure
        .input(restaurantCalendarSettingValidator.updateCalendarSettingSchema)
        .mutation(async ({ input, ctx }) => {
            await calendarSettingEntities.updateCalendarSetting(input)
        }),

    getDailySettings: ownerProcedure
        .input(z.object({ date: z.date() }))
        .query(async ({ input, ctx }) => {
            return await dailySettingEntities.getDailySettings({
                restaurantId: ctx.restaurantId,
                date: input.date
            })
        }),

    updateDailySettings: ownerProcedure
        .input(restaurantDailySettingValidator.updateDailySettingSchema)
        .mutation(async ({ input }) => {
            if (input.dailySetting.closedDinnerHours && input.dailySetting.closedDinnerHours.length > 0) {
                input.dailySetting.closedDinnerHours = input.dailySetting.closedDinnerHours.map(h => localHourToUtcHour(h))
            }
            await dailySettingEntities.updateDailySettings(input)
            return true
        }),





});
