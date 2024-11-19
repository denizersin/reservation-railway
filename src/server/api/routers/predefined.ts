import { predefinedEntities } from "@/server/layer/entities/predefined";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { restaurantEntities } from "@/server/layer/entities/restaurant";

export const predefinedRouter = createTRPCRouter({
    getCountries: publicProcedure.query(async () => {
        return await predefinedEntities.getCountries()
    }),
    getLanguages: publicProcedure
        .query(async () => {
            return await predefinedEntities.getLanguages()
        }),
    getMeals: publicProcedure
        .query(async () => {
            return await predefinedEntities.getMeals()
        }),
    getRestaurantLanguages: publicProcedure.query(async ({ ctx }) => {
        const { restaurantId } = ctx
        return await restaurantEntities.getRestaurantLanguages({ restaurantId })
    }),
});