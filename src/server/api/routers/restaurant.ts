import { restaurantSettingEntities } from "@/server/layer/entities/restaurant-setting";
import { restaurantUseCases } from "@/server/layer/use-cases/restaurant";
import { restaurantGeneralSettingValidator } from "@/shared/validators/restaurant";
import { createTRPCRouter, ownerProcedure, publicProcedure } from "../trpc";
import { restaurantTagValidator } from "@/shared/validators/restaurant-tag";
import { restaurantTagEntities } from "@/server/layer/entities/restaurant-tag";
import { z } from "zod";
import { predefinedEntities } from "@/server/layer/entities/predefined";
import { restaurantEntities } from "@/server/layer/entities/restaurant";
import { restaurantAssetsValidator } from "@/shared/validators/restaurant/restauran-assets";
import { guestValidator } from "@/shared/validators/guest";
import { personelValidator } from "@/shared/validators/user/personel";

export const restaurantRouter = createTRPCRouter({
    updateRestaurantGeneralSettings: ownerProcedure
        .input(restaurantGeneralSettingValidator.updateRestaurantGeneralSettingSchema)
        .mutation(async ({ input, ctx }) => {
            await restaurantSettingEntities.updateRestaurantGeneralSettings({
                generalSetting: input.generalSetting,
                generalSettingID: input.generalSettingID,
            })
            return true
        }),
    getRestaurantGeneralSettings: ownerProcedure
        .query(async ({ ctx }) => {
            const { user: { restaurantId } } = ctx.session
            console.log(restaurantId, 'ctx session restaurantId')
            const generalSettings = await restaurantSettingEntities.getGeneralSettings({ restaurantId: restaurantId! })
            return generalSettings
        }),
    getRestaurantGeneralSettingsToUpdate: ownerProcedure
        .query(async ({ ctx }) => {
            const { user: { restaurantId } } = ctx.session
            console.log(restaurantId, 'ctx session restaurantId')
            const generalSettings = await restaurantSettingEntities.getGeneralSettingsToUpdate({ restaurantId: restaurantId! })
            return generalSettings
        }),
    createTag: ownerProcedure
        .input(restaurantTagValidator.createRestaurantFormSchema)
        .mutation(async ({ input, ctx }) => {
            const { user: { restaurantId } } = ctx.session
            await restaurantTagEntities.createRestaurantTag({
                tag: { restaurantId: restaurantId },
                translations: input.translations
            })
            return true
        }),
    updateTag: ownerProcedure
        .input(restaurantTagValidator.updateRestaurantTagSchema)
        .mutation(async ({ input }) => {
            await restaurantTagEntities.updateRestaurantTagTranslations({
                id: input.id,
                translations: input.translations
            })
            return true
        }),
    getAlltags: ownerProcedure
        .input(restaurantTagValidator.getAllRestaurantTagsSchema)
        .query(async ({ input }) => {
            const tags = await restaurantTagEntities.getAllRestaurantTags2(input)
            return tags
        }),
    deleteTag: ownerProcedure
        .input(z.object({ tagId: z.number() }))
        .mutation(async ({ input }) => {
            await restaurantTagEntities.deleteRestaurantTag(input)
            return true
        }),
    getTagTranslations: ownerProcedure.input(z.object({ tagId: z.number() })).query(async ({ input }) => {
        const translations = await restaurantTagEntities.getRestaurantTagTranslationsById(input)
        return translations
    }),
    getMeals: publicProcedure.query(async () => {
        return await predefinedEntities.getMeals()
    }),
    getLanguages: ownerProcedure.query(async ({ ctx }) => {
        const { session: { user: { restaurantId } } } = ctx
        return await restaurantEntities.getRestaurantLanguages({ restaurantId })
    }),
    updateRestaurantLanguages: ownerProcedure
        .input(z.object({ languages: z.array(z.number()) }))
        .mutation(async ({ input, ctx }) => {
            const { session: { user: { restaurantId } } } = ctx
            await restaurantEntities.updateRestaurantLanguages({ restaurantId, languages: input.languages })
            return true
        }),
    getMealIDs: ownerProcedure.query(async ({ ctx }) => {
        const { session: { user: { restaurantId } } } = ctx
        return await restaurantEntities.getRestaurantMealIds({ restaurantId })
    }),
    getRestaurantMeals: ownerProcedure.query(async ({ ctx }) => {
        const { session: { user: { restaurantId } } } = ctx
        return await restaurantEntities.getRestaurantMeals({ restaurantId })
    }),
    updateRestaurantMeals: ownerProcedure
        .input(restaurantAssetsValidator.restaurantMealsCrudSchema)
        .mutation(async ({ input, ctx }) => {
            const { session: { user: { restaurantId } } } = ctx
            await restaurantUseCases.updateRestaurantMeals({ restaurantId: restaurantId, mealIds: input.mealIds })
            return true
        }),
    getRestaurantMealDays: ownerProcedure.query(async ({ ctx }) => {
        const { session: { user: { restaurantId } } } = ctx
        return await restaurantEntities.getRestaurantMealDays({ restaurantId: restaurantId })
    }),
    updateRestaurantMealDays: ownerProcedure
        .input(restaurantAssetsValidator.restaurantMealDaysCrudSchema)
        .mutation(async ({ input, ctx }) => {
            const { session: { user: { restaurantId } } } = ctx
            await restaurantUseCases.updateRestaurantMealDays({ restaurantId: restaurantId, mealDays: input.mealDays })
            return true
        }),

    createRestaurantMealHours: ownerProcedure
        .input(restaurantAssetsValidator.restaurantMealHoursAddSChema)
        .mutation(async ({ input, ctx }) => {
            const { session: { user
                : { restaurantId } } } = ctx
            await restaurantUseCases.createRestaurantMealHours({ restaurantId: restaurantId, mealHours: input.mealHours })
            return true
        }),
    deleteRestaurantMealHourById: ownerProcedure
        .input(z.object({ mealHourId: z.number() }))
        .mutation(async ({ input }) => {
            await restaurantUseCases.deleteRestaurantMealHour({ mealHourId: input.mealHourId })
            return true
        }),
    getRestaurantMealHours: ownerProcedure
        .input(z.object({ mealId: z.number().optional() }))
        .query(async ({ ctx, input }) => {
            const { session: { user: { restaurantId } } } = ctx
            return await restaurantUseCases.getMealHours({ restaurantId, mealId: input.mealId })
        }),

    updateMealHour: ownerProcedure
        .input(restaurantAssetsValidator.restaurantMealHoursUpdateSchema)
        .mutation(async ({ input }) => {
            await restaurantUseCases.updateMealHour({ data: input })
            return true
        }),
    createPersonel: ownerProcedure
        .input(personelValidator.createPersonelSchema)
        .mutation(async (opt) => {
            await restaurantUseCases.createPersonel(opt)
            return true
        }),
    deletePersonel: ownerProcedure
        .input(personelValidator.deletePersonelSchema)
        .mutation(async (opt) => {
            await restaurantUseCases.deletePersonel(opt)
            return true
        }),
    updatePersonel: ownerProcedure
        .input(personelValidator.updateSchema)
        .mutation(async (opt) => {
            await restaurantUseCases.updatePersonel(opt)
            return true
        }),

    getPersonels: ownerProcedure.query(async (opt) => {
        return await restaurantUseCases.getPersonel(opt)
    }),

});