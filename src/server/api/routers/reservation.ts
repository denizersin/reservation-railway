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
import { tblRoom, tblTable } from "@/server/db/schema";



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
            await reservationUseCases.createReservation({ ctx, input })
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

    updateReservationTable: ownerProcedure
        .input(reservationValidator.updateReservationTable)
        .mutation(async (opts) => {
            await ReservationEntities.updateReservationTable({
                data: opts.input
            })
        }),

    getWaitingTables: ownerProcedure
        .query(async (opts) => {
            const waitingRoom = await db.query.tblRoom.findFirst({
                where: eq(tblRoom.isWaitingRoom, true)
            })
            const tables = await db.query.tblTable.findMany({
                where: eq(tblTable.roomId, waitingRoom?.id!)
            })
            return tables
        }),
    getReservationWaitingTables: ownerProcedure
        .input(z.object({
            date: z.string()
        }))
        .query(async ({ input, ctx }) => {
            const result = await reservationUseCases.getWaitingStatus({
                date: new Date(input.date)
            })
            return result
        }),

    createReservationWaitingSession: ownerProcedure
        .input(z.object({
            reservationId: z.number().int().positive(),
            tableIds: z.array(z.number().int().positive())
        }))
        .mutation(async ({ input }) => {
            await ReservationEntities.createReservationWaitingSession({
                reservationId: input.reservationId,
                tableIds: input.tableIds
            })
        }),

    updateReservationWaitingSession: ownerProcedure
        .input(z.object({
            reservationId: z.number().int().positive(),
            tableIds: z.array(z.number().int().positive())
        }))
        .mutation(async ({ input }) => {
            await ReservationEntities.updateReservationWaitingSessionWithTables({
                reservationId: input.reservationId,
                tableIds: input.tableIds
            })
        }),

    getReservations: ownerProcedure
        .input(
            reservationValidator.getReservations
        )
        .query(async (opts) => {
            const r = await reservationUseCases.getReservations(opts)
            return r;
        }),

    updateReservationStatus: ownerProcedure
        .input(z.object({
            reservationId: z.number().int().positive(),
            reservationStatusId: z.number().int().positive()
        }))
        .mutation(async ({ input }) => {
            await db.update(tblReservation).set({
                reservationStatusId: input.reservationStatusId
            }).where(
                eq(tblReservation.id, input.reservationId)
            )
        }),

    checkInReservation: ownerProcedure
        .input(reservationValidator.checkInReservation)
        .mutation(async (opts) => {
            await reservationUseCases.checkInReservation(opts)
        }),
    
    takeReservationIn: ownerProcedure
        .input(reservationValidator.takeReservationIn)
        .mutation(async (opts) => {
            await reservationUseCases.takeReservationIn(opts)
        }),

});
