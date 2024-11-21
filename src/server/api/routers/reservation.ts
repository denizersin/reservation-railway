import { db } from "@/server/db";
import { tblRoom, tblTable } from "@/server/db/schema";
import { tblReservation } from "@/server/db/schema/reservation";
import { predefinedEntities } from "@/server/layer/entities/predefined";
import { ReservationEntities } from "@/server/layer/entities/reservation";
import { reservationLimitationEntities } from "@/server/layer/entities/reservation-limitation";
import { userEntities } from "@/server/layer/entities/user";
import { reservationUseCases } from "@/server/layer/use-cases/reservation";
import { reservationLimitationUseCases } from "@/server/layer/use-cases/reservation-limitation.ts";
import { reservationValidator } from "@/shared/validators/reservation";
import { limitationValidator } from "@/shared/validators/reservation-limitation/inex";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, ownerProcedure, publicProcedure } from "../trpc";
import { TOAST_MESSAGE_HEADER_KEY } from "@/shared/constants";
import { NextResponse } from "next/server";
import { clientQueryValidator } from "@/shared/validators/front/reservation";
import { getRandom, localHourToUtcHour } from "@/server/utils/server-utils";
import { clientFormValidator } from "@/shared/validators/front/create";
import { clientReservationActionValidator } from "@/shared/validators/front/reservation-actions";



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
            if (input.data.hour) {
                input.data.hour = localHourToUtcHour(input.data.hour)
            }
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
            await reservationUseCases.createReservation({ ctx, input })
            return true
        }),



    getAllAvailableReservation2: ownerProcedure
        .input(reservationValidator.getTableStatues)
        .query(async (opts) => {
            return await reservationUseCases.getAllAvailableReservations(opts)
        }),

    getTableStatues: ownerProcedure
        .input(reservationValidator.getTableStatues)
        .query(async (opts) => {
            return await reservationUseCases.getAllAvailableReservations2(opts)
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
            const user = await userEntities.getUserById({ userId: opts.ctx.session.user.userId })
            // await reservationUseCases.updateReservation({
            //     input: opts.input,
            //     owner: user?.name || 'unknown',
            //     ctx: opts.ctx
            // })
        }),

    updateReservationTable: ownerProcedure
        .input(reservationValidator.updateReservationTable)
        .mutation(async (opts) => {

            await reservationUseCases.updateReservationTable(opts)
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

    checkOutAndCompleteReservation: ownerProcedure
        .input(reservationValidator.checkOutAndCompleteReservation)
        .mutation(async (opts) => {
            await reservationUseCases.checkOutAndCompleteReservation(opts)
        }),

    takeReservationIn: ownerProcedure
        .input(reservationValidator.takeReservationIn)
        .mutation(async (opts) => {
            await reservationUseCases.takeReservationIn(opts)
        }),


    makeReservationNotExist: ownerProcedure
        .input(reservationValidator.makeReservationNotExist)
        .mutation(async (opts) => {
            await reservationUseCases.makeReservationNotExist(opts)
        }),

    getReservationDetail: ownerProcedure
        .input(reservationValidator.getReservationDetail)
        .query(async (opts) => {
            return await reservationUseCases.getReservationDetail(opts)
        }),

    requestForConfirmation: ownerProcedure
        .input(reservationValidator.requestForConfirmation)
        .mutation(async (opts) => {
            await reservationUseCases.requestForConfirmation(opts)
        }),
    cancelConfirmationRequest: ownerProcedure
        .input(reservationValidator.cancelConfirmationRequest)
        .mutation(async (opts) => {
            await reservationUseCases.cancelConfirmationRequest(opts)
        }),

    confirmReservation: ownerProcedure
        .input(reservationValidator.confirmReservation)
        .mutation(async (opts) => {
            await reservationUseCases.confirmReservation(opts)
        }),

    cancelReservation: ownerProcedure
        .input(reservationValidator.cancelReservation)
        .mutation(async (opts) => {
            await reservationUseCases.cancelReservation(opts)
        }),

    notifyPrepayment: ownerProcedure
        .input(reservationValidator.notifyPrepayment)
        .mutation(async (opts) => {
            await reservationUseCases.notifyPrepayment(opts)
        }),

    requestForPrepayment: ownerProcedure
        .input(reservationValidator.requestForPrepayment)
        .mutation(async (opts) => {
            await reservationUseCases.requestForPrepayment(opts)
        }),

    cancelPrepayment: ownerProcedure
        .input(reservationValidator.cancelPrepayment)
        .mutation(async (opts) => {
            await reservationUseCases.cancelPrepayment(opts)
        }),

    getReservationLogs: ownerProcedure
        .input(reservationValidator.getReservationLogs)
        .query(async (opts) => {
            return await reservationUseCases.getReservationLogs(opts)
        }),

    getReservationNotifications: ownerProcedure
        .input(reservationValidator.getReservationNotifications)
        .query(async (opts) => {
            return await reservationUseCases.getReservationNotifications(opts)
        }),

    repeatReservation: ownerProcedure
        .input(reservationValidator.repeatReservation)
        .mutation(async (opts) => {
            // await reservationUseCases.repeatReservation(opts)
        }),

    askForBill: ownerProcedure
        .input(reservationValidator.askForBill)
        .mutation(async (opts) => {
            // await reservationUseCases.askForBill(opts)
        }),
    deleteReservation: ownerProcedure
        .input(reservationValidator.deleteReservation)
        .mutation(async (opts) => {
            await reservationUseCases.deleteReservation(opts)
        }),

    updateReservationTime: ownerProcedure
        .input(reservationValidator.updateReservationTime)
        .mutation(async (opts) => {
            await reservationUseCases.updateReservationTime(opts)
        }),
    updateReservationAssignedPersonal: ownerProcedure
        .input(reservationValidator.updateReservationAssignedPersonal)
        .mutation(async (opts) => {
            await reservationUseCases.updateReservationAssignedPersonal(opts)
        }),
    updateReservationNote: ownerProcedure
        .input(reservationValidator.updateReservationNote)
        .mutation(async (opts) => {
            await reservationUseCases.updateReservationNote(opts)
        }),


    getMonthAvailability: publicProcedure
        .input(clientQueryValidator.monthAvailabilityQuerySchema)
        .query(async (opts) => {
            return await reservationUseCases.getMonthAvailability(opts)
        }),
    getMonthAvailabilityByGuestCount: publicProcedure
        .input(clientQueryValidator.monthAvailabilityByGuestCountQuerySchema)
        .query(async (opts) => {
            return await reservationUseCases.getMonthAvailabilityByGuestCount(opts)
        }),

    createReservation: publicProcedure
        .input(clientFormValidator.createReservationSchema)
        .mutation(async (opts) => {
            const newReservationId = await reservationUseCases.createPublicReservation(opts)
            return { newReservationId }
        }),

    getReservationStatusData: publicProcedure
        .input(z.object({
            reservationId: z.number().int().positive()
        }))
        .query(async (opts) => {
            return await reservationUseCases.getReservationStatusData(opts)
        }),

    cancelPublicReservation: publicProcedure
        .input(z.object({
            reservationId: z.number().int().positive()
        }))
        .mutation(async (opts) => {
            await reservationUseCases.cancelPublicReservation(opts)
        }),
    confirmPublicReservation: publicProcedure
        .input(clientReservationActionValidator.confirmReservation)
        .mutation(async (opts) => {
            await reservationUseCases.confirmPublicReservation(opts)
        }),
    occupyTable: publicProcedure
        .input(clientFormValidator.occupyTableSchema)
        .mutation(async (opts) => {
            // await reservationUseCases.occupyTable(opts)
        }),
});
