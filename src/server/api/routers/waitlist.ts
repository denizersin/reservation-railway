import { predefinedEntities } from "@/server/layer/entities/predefined";
import { clientProcedure, createTRPCRouter, ownerProcedure, publicProcedure } from "../trpc";
import { restaurantEntities } from "@/server/layer/entities/restaurant";
import { z } from "zod";
import { reservationUseCases } from "@/server/layer/use-cases/reservation";
import { clientValidator } from "@/shared/validators/front/create";
import { waitlistValidators } from "@/shared/validators/waitlist/waitlist";
import { waitlistEntities } from "@/server/layer/entities/waitlist";

export const waitlistRouter = createTRPCRouter({
    createWaitlist: clientProcedure
        .input(clientValidator.createWaitlistSchema)
        .mutation(async (opts) => {
            const waitlistId = await reservationUseCases.createWaitlist(opts)
            return { waitlistId }
        }),
    cancelWaitlist: clientProcedure
        .input(z.object({
            waitlistId: z.number().int().positive()
        }))
        .mutation(async (opts) => {
            await reservationUseCases.cancelWaitlist(opts)
        }),
    getWaitlistStatusData: clientProcedure
        .input(z.object({
            waitlistId: z.number().int().positive()
        }))
        .query(async (opts) => {
            return await waitlistEntities.getWaitlistById({ waitlistId: opts.input.waitlistId })

        }),
    createReservationFromWaitlist: ownerProcedure
        .input(waitlistValidators.createReservationFromWaitlist)
        .mutation(async (opts) => {
            await reservationUseCases.createReservationFromWaitlist(opts)
        }),

    getWaitlists: ownerProcedure
        .input(waitlistValidators.getWaitlists)
        .query(async (opts) => {
            return await reservationUseCases.getWaitlists(opts)
        }),
    queryWaitlistAvailability: ownerProcedure
        .input(waitlistValidators.queryWaitlistAvailability)
        .mutation(async (opts) => {
            return await reservationUseCases.queryWaitlistAvailability(opts)
        }),
    deleteWaitlist: ownerProcedure
        .input(z.object({
            waitlistId: z.number().int().positive()
        }))
        .mutation(async (opts) => {
            await waitlistEntities.deleteWaitlist({ waitlistId: opts.input.waitlistId })
        }),



});

