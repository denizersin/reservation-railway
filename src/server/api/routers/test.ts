import { reservationUseCases } from "@/server/layer/use-cases/reservation";
import { z } from "zod";
import { createTRPCRouter, ownerProcedure, publicProcedure } from "../trpc";

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

    sendMail: publicProcedure
        .input(z.object({

        }))
        .mutation(async ({ input }) => {



        }),

    syncHoldingReservation: ownerProcedure
        .input(z.object({}))
        .mutation(async (opts) => {
            const result = await reservationUseCases.syncHoldingReservations(opts)
            return result
        }),

});

