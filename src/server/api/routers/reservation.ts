import { predefinedEntities } from "@/server/layer/entities/predefined";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const reservationRouter = createTRPCRouter({
    getReservationSatues: publicProcedure.query(async () => {
        return await predefinedEntities.getReservationSatues()
    })
});