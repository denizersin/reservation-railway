import { guestValidator } from "@/shared/validators/guest";
import { createTRPCRouter, ownerProcedure } from "../trpc";
import { guestEntities } from "@/server/layer/entities/guest";
import { z } from "zod";

export const guestRouter = createTRPCRouter({
    createGuest: ownerProcedure.input(guestValidator.createGuestSchema).mutation(async ({ input, ctx }) => {
        const { session: { user: { restaurantId } } } = ctx

        await guestEntities.createGuest({
            guestData: {
                ...input,
                restaurantId
            }
        });
    }),

    updateGuest: ownerProcedure.input(guestValidator.updateGuestSchema).mutation(async ({ input, ctx }) => {
        await guestEntities.updateGuest({
            id: input.id,
            guestData: {
                ...input.data,
            }
        });
    }),

    deleteGuest: ownerProcedure.input(z.object({
        guestId: z.number().int().positive()
    })).mutation(async ({ input }) => {
        await guestEntities.deleteGuestById({
            id: input.guestId
        });
    }),

    getAllGuests: ownerProcedure.input(guestValidator.getAllGuestsValidatorSchema).query(async ({ input }) => {
        return await guestEntities.getAllGuests(input)
    }),

    getGuestCompanies: ownerProcedure.query(async ({ ctx }) => {
        const { session: { user: { restaurantId } } } = ctx
        return await guestEntities.getGuestCompanies({ restaurantId })
    }),
    createGuestCompanyWithName: ownerProcedure.input(z.object({
        companyName: z.string()
    })).mutation(async ({ input, ctx }) => {
        const { session: { user: { restaurantId } } } = ctx
        await guestEntities.createGuestCompany({
            companyName: input.companyName,
            restaurantId
        });
    }),

    getGuestDetail: ownerProcedure.input(z.object({
        guestId: z.number().int().positive()
    })).query(async ({ input }) => {
        return await guestEntities.getGuestDetail({ guestId: input.guestId })
    }),
    getGuest: ownerProcedure.input(z.object({
        guestId: z.number().int().positive()
    })).query(async ({ input }) => {
        return await guestEntities.getGuestById({ guestId: input.guestId })
    }),




});