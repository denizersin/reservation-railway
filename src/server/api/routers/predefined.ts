import { predefinedEntities } from "@/server/layer/entities/predefined";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const predefinedRouter = createTRPCRouter({
    getCountries: publicProcedure.query(async () => {
        return await predefinedEntities.getCountries()
    }),
    getLanguages: publicProcedure
        .query(async () => {
            return await predefinedEntities.getLanguages()
        })
});