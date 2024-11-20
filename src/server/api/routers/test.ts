import { predefinedEntities } from "@/server/layer/entities/predefined";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { restaurantEntities } from "@/server/layer/entities/restaurant";
import { z } from "zod";
import { reservationUseCases } from "@/server/layer/use-cases/reservation";

export const testRouter = createTRPCRouter({
    makePrepayment: publicProcedure
        .input(z.object({
            reservationId: z.number().int().positive()
        }))
        .mutation(async ({ input }) => {
            const result = await reservationUseCases.handleSuccessPrepaymentPublicReservation({
                reservationId: input.reservationId
            })
            return result
        }),
});

