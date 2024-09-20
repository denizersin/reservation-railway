import { restaurantSettingEntities } from "@/server/layer/entities/restaurant-setting";
import { restaurantUseCases } from "@/server/layer/use-cases/restaurant";
import { restaurantGeneralSettingValidator } from "@/shared/validators/restaurant";
import { createTRPCRouter, ownerProcedure, publicProcedure } from "../trpc";
import { restaurantTagValidator } from "@/shared/validators/restaurant-tag";
import { restaurantTagEntities } from "@/server/layer/entities/restaurant-tag";
import { z } from "zod";
import { predefinedEntities } from "@/server/layer/entities/predefined";
import { restaurantEntities } from "@/server/layer/entities/restaurant";

export const restaurantRouter = createTRPCRouter({
    updateRestaurantGeneralSettings: ownerProcedure
        .input(restaurantGeneralSettingValidator.updateRestaurantGeneralSettingSchema)
        .mutation(async ({ input, ctx }) => {
            const { user: { restaurantId } } = ctx.session
            await restaurantSettingEntities.updateRestaurantGeneralSettings({
                generalSetting: input,
                restaurantId: restaurantId!
            })
            return true
        }),
    getRestaurantGeneralSettings: ownerProcedure
        .query(async ({ ctx }) => {
            const { user: { restaurantId } } = ctx.session
            const generalSettings = await restaurantUseCases.getRestaurantGeneralSettings({ restaurantId: restaurantId! })
            return generalSettings
        }),
    createTag: ownerProcedure
        .input(restaurantTagValidator.createRestaurantFormSchema)
        .mutation(async ({ input, ctx }) => {
            const { user: { restaurantId } } = ctx.session
            await restaurantTagEntities.createRestaurantTag({
                restaurantId: restaurantId!,
                translations: input.translations
            })
            return true
        }),
    getAllTags: ownerProcedure
        .input(restaurantTagValidator.getAllRestaurantTagsSchema)
        .query(async ({ input }) => {
            const tags = await restaurantTagEntities.getAllRestaurantTags(input)
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
});