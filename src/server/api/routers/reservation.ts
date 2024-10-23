import { db } from "@/server/db";
import { tblReservation } from "@/server/db/schema/reservation";
import { predefinedEntities } from "@/server/layer/entities/predefined";
import { ReservationEntities } from "@/server/layer/entities/reservation";
import { reservationLimitationEntities } from "@/server/layer/entities/reservation-limitation";
import { reservationUseCases } from "@/server/layer/use-cases/reservation";
import { reservationLimitationUseCases } from "@/server/layer/use-cases/reservation-limitation.ts";
import { getLocalTime, getStartAndEndOfDay, localHourToUtcHour, utcHourToLocalHour } from "@/server/utils/server-utils";
import { reservationValidator } from "@/shared/validators/reservation";
import { limitationValidator } from "@/shared/validators/reservation-limitation/inex";
import { and, between, eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, ownerProcedure, publicProcedure } from "../trpc";



export const reservationRouter = createTRPCRouter({
    getReservationSatues: publicProcedure.query(async () => {
        return await predefinedEntities.getReservationSatues()
    }),

    createReservationLimitation: ownerProcedure
        .input(limitationValidator.createLimitationSchema)
        .mutation(async ({ input, ctx }) => {
            const { session: { user: { restaurantId } } } = ctx
            await reservationLimitationUseCases.createLimitation({
                limitationData: {
                    ...input,
                    restaurantId
                }
            })
        }),

    updateReservationLimitation: ownerProcedure
        .input(limitationValidator.updateLimitationSchema)
        .mutation(async ({ input }) => {
            await reservationLimitationEntities.updateLimitation({
                id: input.limitationId,
                ...input.data
            })
        }),
    getReservationLimitations: ownerProcedure.query(async ({ ctx }) => {
        const { session: { user: { restaurantId } } } = ctx
        return await reservationLimitationEntities.getLimitations({ restaurantId })
    }),
    deleteReservationLimitation: ownerProcedure
        .input(z.object({
            limitationId: z.number().int().positive()
        }))
        .mutation(async ({ input }) => {
            await reservationLimitationEntities.deleteLimitationById({
                limitationId: input.limitationId
            })
        }),
    createPermanentLimitation: ownerProcedure
        .input(limitationValidator.createPermanentLimitationSchema)
        .mutation(async ({ input, ctx }) => {
            const { session: { user: { restaurantId } } } = ctx
            await reservationLimitationUseCases.createPermanentLimitation({
                permanentLimitationData: {
                    ...input,
                    restaurantId
                }
            })
        }),
    deletePermanentLimitation: ownerProcedure
        .input(z.object({
            limitationId: z.number().int().positive()
        }))
        .mutation(async ({ input }) => {
            await reservationLimitationEntities.deletePermanentLimitationById({
                limitationId: input.limitationId
            })
        }),

    getPermanentLimitations: ownerProcedure.query(async ({ ctx }) => {
        const { session: { user: { restaurantId } } } = ctx
        return await reservationLimitationEntities.getPermanentLimitations({ restaurantId })
    }),

    createMockReservation: ownerProcedure
        .input(reservationValidator.createReservation)
        .mutation(async ({ input, ctx }) => {
            const { session: { user: { restaurantId } } } = ctx
            console.log(input.reservationDate, 'input.reservationDate')
            const hour = localHourToUtcHour(input.hour)
            input.reservationDate.setUTCHours(Number(hour.split(':')[0]), Number(hour.split(':')[1]), 0)
            await ReservationEntities.createReservation({
                ...input,
                restaurantId,
                hour,


            })
        }),


    getReservations: ownerProcedure
        .input(z.object({
            date: z.date()
        }))
        .query(async ({ input, ctx }) => {
            const { session: { user: { restaurantId } } } = ctx
            const { start, end } = getStartAndEndOfDay({
                date:
                    getLocalTime(input.date)
            })


            const reservations = await db.query.tblReservation.findMany({
                with: {
                    tables: {
                        with: {
                            table: true,



                        }
                    },
                    guest: true,
                },
                where: and(
                    eq(tblReservation.restaurantId, restaurantId),
                    between(tblReservation.reservationDate, start, end)
                )
            })
            reservations.forEach(r => {
                // r.reservationDate = getLocalTime(r.reservationDate)
                r.hour = utcHourToLocalHour(r.hour)
            })

            return reservations
        }),

    deleteReservation: ownerProcedure
        .input(z.object({
            reservationId: z.number().int().positive()
        }))
        .mutation(async ({ input }) => {
            await db.delete(tblReservation).where(
                eq(tblReservation.id, input.reservationId)
            )
        }),

    getAllAvailableReservation2: ownerProcedure
        .input(reservationValidator.getTableStatues)
        .query(async (opts) => {
            return await reservationUseCases.getAllAvailableReservations(opts)
        }),
    removeTableFromReservation: ownerProcedure
        .input(z.object({
            reservationId: z.number().int().positive(),
            reservationTableId: z.number().int().positive()
        }))
        .mutation(async ({ input }) => {
            await ReservationEntities.removeTableFromReservation({
                reservationId: input.reservationId,
                reservationTableId: input.reservationTableId
            })
        }),

    addNewTablesToReservation: ownerProcedure
        .input(z.object({
            reservationTables: z.array(z.object({
                reservationId: z.number().int().positive(),
                tableId: z.number().int().positive()
            }))
        }))
        .mutation(async ({ input }) => {
            await ReservationEntities.addNewTablesToReservation({
                reservationTables: input.reservationTables
            })
        }),

    linkReservation: ownerProcedure
        .input(z.object({
            reservationId: z.number().int().positive(),
            linkedReservationId: z.number().int().positive()
        }))
        .mutation(async ({ input }) => {
            await ReservationEntities.linkReservation({
                reservationId: input.reservationId,
                linkedReservationId: input.linkedReservationId
            })
        }),

    unlinkReservation: ownerProcedure
        .input(z.object({
            reservationId: z.number().int().positive()
        }))
        .mutation(async ({ input }) => {
            await ReservationEntities.unlinkReservation({
                reservationId: input.reservationId
            })
        }),

    updateReservation: ownerProcedure
        .input(reservationValidator.updateReservation)
        .mutation(async (opts) => {
            await reservationUseCases.updateReservation(opts)
        }),
});