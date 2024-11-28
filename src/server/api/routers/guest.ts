import { guestValidator } from "@/shared/validators/guest";
import { createTRPCRouter, ownerProcedure } from "../trpc";
import { guestEntities } from "@/server/layer/entities/guest";
import { z } from "zod";
import { predefinedEntities } from "@/server/layer/entities/predefined";
import { TGuest, TGuestSelect } from "@/server/db/schema";

export const guestRouter = createTRPCRouter({
    createGuest: ownerProcedure.input(guestValidator.createGuestSchema).mutation(async ({ input, ctx }) => {
        const { session: { user: { restaurantId } } } = ctx
        const fullPhone = await predefinedEntities.getFullPhone({ phone: input.phone, phoneCodeId: input.phoneCodeId })
        await guestEntities.createGuest({
            guestData: {
                ...input,
                fullPhone,
                restaurantId
            }
        });
    }),

    updateGuest: ownerProcedure.input(guestValidator.updateGuestSchema).mutation(async ({ input, ctx }) => {
        // input.data.
        const guestData:Partial<TGuestSelect> = { ...input.data }
        if (input.data.phone && input.data.phoneCodeId) {
            guestData.fullPhone = await predefinedEntities.getFullPhone({ phone: input.data.phone, phoneCodeId: input.data.phoneCodeId })
        }
        await guestEntities.updateGuest({
            id: input.id,
            guestData
        });
    }),

    deleteGuest: ownerProcedure.input(z.object({
        guestId: z.number().int().positive()
    })).mutation(async ({ input }) => {
        await guestEntities.deleteGuestById({
            id: input.guestId
        });
    }),

    getGuestsPagination: ownerProcedure.input(guestValidator.guestsPaginationSchema).query(async ({ input, ctx }) => {
        const { session: { user: { restaurantId } } } = ctx
        return await guestEntities.guestsPagination({ restaurantId, paginationQuery: input })
    }),

    getGuestCompaniesPagination: ownerProcedure
        .input(guestValidator.guestCompanyPaginationSchema)
        .query(async ({ ctx, input }) => {
            const { session: { user: { restaurantId } } } = ctx
            return await guestEntities.getGuestCompaniesPagination({ restaurantId, paginationQuery: input })
        }),
    createGuestCompanyWithName: ownerProcedure.input(guestValidator.createGuestCompanySchema).mutation(async ({ input, ctx }) => {
        const { session: { user: { restaurantId } } } = ctx
        await guestEntities.createGuestCompany({
            data: {
                ...input,
                restaurantId
            }
        });
    }),

    updateGuestCompany: ownerProcedure.input(guestValidator.updateGuestCompanySchema).mutation(async ({ input }) => {
        await guestEntities.updateGuestCompany({
            id: input.id,
            data: input.data
        });
    }),

    deleteGuestCompany: ownerProcedure.input(z.object({
        guestCompanyId: z.number().int().positive()
    })).mutation(async ({ input }) => {
        await guestEntities.deleteGuestCompany({ id: input.guestCompanyId })
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