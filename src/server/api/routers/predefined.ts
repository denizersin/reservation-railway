import { predefinedEntities } from "@/server/layer/entities/predefined";
import { clientProcedure, createTRPCRouter, publicProcedure } from "../trpc";
import { restaurantEntities } from "@/server/layer/entities/restaurant";

export const predefinedRouter = createTRPCRouter({
    getCountries: clientProcedure.query(async () => {
        return await predefinedEntities.getCountries()
    }),
    getLanguages: clientProcedure
        .query(async () => {
            return await predefinedEntities.getLanguages()
        }),
    getMeals: clientProcedure
        .query(async () => {
            return await predefinedEntities.getMeals()
        }),
    getRestaurantLanguages: clientProcedure.query(async ({ ctx }) => {
        const { restaurantId } = ctx
        return await restaurantEntities.getRestaurantLanguages({ restaurantId })
    }),
});