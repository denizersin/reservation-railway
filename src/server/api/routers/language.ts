import { z } from "zod";
import { createTRPCRouter, ownerProcedure } from "../trpc";
import { LanguageEntity } from "@/server/layer/entities/language";
import { restaurantMessagesValidators } from "@/shared/validators/language";
import { languageUseCases } from "@/server/layer/use-cases/language";

export const languageRouter = createTRPCRouter({

    getReservationMessageByLanguage: ownerProcedure
        .input(z.object({
            languageId: z.number().positive(),
        })
        ).query(async ({ input, ctx }) => {
            const { session: { user: { restaurantId } } } = ctx
            const data = await languageUseCases.getReservationMessages({ restaurantId, languageId: input.languageId })
            return data
        }),
    updateReservationMessages: ownerProcedure
        .input(restaurantMessagesValidators.updateReservationMessagesSchema)
        .mutation(async ({ input, ctx }) => {
            const { session: { user: { restaurantId } } } = ctx;
            const { languageId } = input
            const data = await LanguageEntity.updateReservationMessages({
                restaurantId,
                languageId,
                ...input.reservationMessages
            })
        }),

    getProvisionMessageByLanguage: ownerProcedure
        .input(z.object({
            languageId: z.number().positive(),
        })
        ).query(async ({ input, ctx }) => {
            const { session: { user: { restaurantId } } } = ctx
            const data = await languageUseCases.getProvisionMessages({ restaurantId, languageId: input.languageId })
            return data
        }),
    updateProvisionMessages: ownerProcedure
        .input(restaurantMessagesValidators.updateProvisionMessagesSchema)
        .mutation(async ({ input, ctx }) => {
            const { session: { user: { restaurantId } } } = ctx;
            const { languageId } = input
            const data = await LanguageEntity.updateProvisionMessages({
                restaurantId,
                languageId,
                ...input.provisionMessage
            })
            return data
        }),
    getWaitlistMessageByLanguage: ownerProcedure
        .input(z.object({
            languageId: z.number().positive(),
        })
        ).query(async ({ input, ctx }) => {
            const { session: { user: { restaurantId } } } = ctx
            const data = await languageUseCases.getWaitlistMessages({ restaurantId, languageId: input.languageId })
            return data
        }),
    updateWaitlistMessages: ownerProcedure
        .input(restaurantMessagesValidators.updateWaitlistMessagesSchema)
        .mutation(async ({ input, ctx }) => {
            const { session: { user: { restaurantId } } } = ctx;
            const { languageId } = input
            const data = await LanguageEntity.updateWaitlistMessages({
                restaurantId,
                languageId,
                ...input.waitlistMessage
            })
            return data
        }),

    getPrepaymentMessageByLanguage: ownerProcedure
        .input(z.object({
            languageId: z.number().positive(),
        }))
        .query(async ({ input, ctx }) => {
            const { session: { user: { restaurantId } } } = ctx
            const data = await languageUseCases.getPrepaymentMessages({ restaurantId, languageId: input.languageId })
            return data
        }),

    updatePrepaymentMessages: ownerProcedure
        .input(restaurantMessagesValidators.updatePrepaymentMessagesSchema)
        .mutation(async ({ input, ctx }) => {
            const { session: { user: { restaurantId } } } = ctx;
            const { languageId } = input
            const data = await LanguageEntity.updatePrepaymentMessages({
                restaurantId,
                languageId,
                ...input.prepaymentMessage
            })
            return data
        }),
    getRestaurantTexts: ownerProcedure
        .input(
            z.object({ languageId: z.number().positive(), })
        )
        .query(async ({ input, ctx }) => {
            const { session: { user: { restaurantId } } } = ctx;
            const { languageId } = input;
            const data = await languageUseCases.getRestaurantTexts({ restaurantId, languageId });
            return data;
        }),
    updateRestaurantTexts: ownerProcedure
        .input(restaurantMessagesValidators.updateRestaurantTextsSchema)
        .mutation(async ({ input, ctx }) => {
            const { session: { user: { restaurantId } } } = ctx;

            const { languageId, restaurantTexts } = input;

            const updatedTexts = await LanguageEntity.updateRestaurantTexts({
                restaurantId,
                languageId,
                ...restaurantTexts,
            });

            return updatedTexts;
        }),
});

