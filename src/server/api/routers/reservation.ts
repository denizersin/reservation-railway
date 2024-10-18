import { predefinedEntities } from "@/server/layer/entities/predefined";
import { reservationLimitationEntities } from "@/server/layer/entities/reservation-limitation";
import { reservationLimitationUseCases } from "@/server/layer/use-cases/reservation-limitation.ts";
import { limitationValidator } from "@/shared/validators/reservation-limitation/inex";
import { z } from "zod";
import { createTRPCRouter, ownerProcedure, publicProcedure } from "../trpc";



import { db } from "@/server/db";
import { tblReservation, tblReservationTables } from "@/server/db/schema/reservation";
import { tblReservationLimitation } from "@/server/db/schema/resrvation_limitation";
import { tblMealHours } from "@/server/db/schema/restaurant-assets";
import { tblRoom, tblTable } from "@/server/db/schema/room";
import { getLocalTime, getStartAndEndOfDay, localHourToUtcHour, utcHourToLocalHour } from "@/server/utils/server-utils";
import TReservationValidator, { reservationValidator } from "@/shared/validators/reservation";
import { and, between, count, eq, isNotNull, isNull, or, sql, sum } from "drizzle-orm";
import { restaurantEntities } from "@/server/layer/entities/restaurant";
import { ReservationEntities } from "@/server/layer/entities/reservation";
import { tblGuest } from "@/server/db/schema";


function getAvaliabels({ date, mealId }: TReservationValidator.getTableStatues) {

    const { start, end } = getStartAndEndOfDay({
        date:
            getLocalTime(date)
    })

    return db
        .select({
            limitationId: tblReservationLimitation.id,
            hour: tblReservationLimitation.hour,
            meal: tblReservationLimitation.mealId,
            room: tblReservationLimitation.roomId,
            maxTable: tblReservationLimitation.maxTableCount,
            maxGuest: tblReservationLimitation.maxGuestCount,
            // totalTable: count(tblReservation.id).as('totalTable'),
            totalTable: sql`count(${tblReservation.id})`.as('totalTable'),
            // totalGuest: sum(tblReservation.guestCount).as('totalGuest'),
            totalGuest: sql<number>`cast(${sum(tblReservation.guestCount)} as SIGNED)`.as('totalGuest'),
            // avaliableGuest: sql`${tblReservationLimitation.maxGuestCount} - ${sum(tblReservation.guestCount)}`.as('avaliableGuest'),
            avaliableGuest: sql<number>`${tblReservationLimitation.maxGuestCount} - cast(${sum(tblReservation.guestCount)} as SIGNED)`.as('availableGuest'),

            avaliableTable: sql<number>`${tblReservationLimitation.maxTableCount} - ${(count(tblReservation.id))}`.as('avaliableTable'),
        })
        .from(tblReservationLimitation)
        .leftJoin(tblReservation,
            and(
                eq(tblReservationLimitation.restaurantId, tblReservation.restaurantId),
                eq(tblReservation.roomId, tblReservationLimitation.roomId),
                eq(tblReservationLimitation.mealId, tblReservation.mealId),

                between(tblReservation.hour, tblReservationLimitation.minHour, tblReservationLimitation.maxHour),
            )
        )
        .where(
            and(
                eq(tblReservationLimitation.isActive, true),
                between(tblReservation.reservationDate, start, end),
                eq(tblReservation.hour, tblReservationLimitation.hour),
            )
        )
        .groupBy(tblReservationLimitation.id)
}






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
            // await db.insert(tblReservation).values({
            //     restaurantId,
            //     guestCount: input.guestCount,
            //     reservationDate: input.reservationDate,
            //     roomId: input.roomId,
            //     hour: hour,
            //     guestId: input.guestId,
            //     mealId: input.mealId
            //     tableId: input.tableId,
            // })
            await ReservationEntities.createReservation({
                ...input,
                restaurantId,
                hour,


            })
        }),



    // getAllAvailableReservation: ownerProcedure
    //     .input(reservationValidator.getTableStatues)
    //     .query(async ({ input, ctx }) => {
    //         const { session: { user: { restaurantId } } } = ctx


    //         const { start, end } = getStartAndEndOfDay({
    //             date:
    //                 getLocalTime(input.date)
    //         })

    //         console.log(start, end, 's-e')

    //         const limitedAvailableHours = getAvaliabels(input).as('limitedAvailableHours')

    //         const limitedAvailableHoursInfo = await getAvaliabels(input)

    //         const TEST = await db
    //             .select()
    //             .from(tblRoom)
    //             .leftJoin(tblTable, eq(tblTable.roomId, tblRoom.id))
    //             .leftJoin(tblReservation,
    //                 and(
    //                     //!TODO: remove this
    //                     eq(tblReservation.mealId, input.mealId),
    //                     eq(tblReservation.tableId, tblTable.id),
    //                     between(tblReservation.reservationDate, start, end)
    //                 )
    //             )
    //             .leftJoin(tblMealHours,
    //                 isNotNull(tblMealHours.id)
    //                 // or(
    //                 //     isNull(tblReservation.id),
    //                 //     eq(tblReservation.hour, tblMealHours.hour),
    //                 // )
    //             )
    //             .where(and(
    //                 eq(tblRoom.restaurantId, 2),
    //                 isNotNull(tblTable.id)
    //             ))




    //         // TEST.forEach(r => {
    //         //     if (
    //         //         (r.limitedAvailableHours && r.table) //table has limitation
    //         //         &&
    //         //         //case: avaliable 3    min-2 max-5 then table-max will be 3
    //         //         (
    //         //             r.table.minCapacity <= r.limitedAvailableHours.avaliableGuest &&
    //         //             r.limitedAvailableHours.avaliableGuest < r.table?.maxCapacity
    //         //         )) {
    //         //         r.table.maxCapacity = r.limitedAvailableHours.avaliableGuest
    //         //     }
    //         // })


    //         type NewTable = typeof TEST[0]['table'] & {
    //             isReserved: boolean
    //             isReachedLimit: boolean
    //             avaliableGuestWithLimit: number
    //             isAppliedLimit: boolean
    //             hour: string
    //         }

    //         const tables: NewTable[] = []

    //         TEST.forEach(rr => {
    //             if (!rr.table || !rr.meal_hours) return

    //             const reservation = rr.reservation ? { ...rr.reservation } : null
    //             const meal_hours = { ...rr.meal_hours }

    //             const table: NewTable = {
    //                 ...rr.table,
    //                 avaliableGuestWithLimit: rr.table.maxCapacity,
    //                 isReserved: false,
    //                 isReachedLimit: false,
    //                 isAppliedLimit: false,
    //                 hour: meal_hours.hour
    //             }
    //             tables.push(table)

    //             if (
    //                 (reservation)
    //             ) {
    //                 table.isReserved = true
    //                 return;
    //             }
    //             console.log(limitedAvailableHoursInfo, 'limitedAvailableHoursInfo')
    //             const limited = limitedAvailableHoursInfo.find(r => (r.hour === meal_hours.hour && r.room === table.roomId))
    //             console.log(Boolean(limited), 'limited')
    //             if (limited?.hour) {
    //                 console.log(limited?.hour, meal_hours.hour, 'limited hour')
    //             }
    //             if (!limited) return;

    //             if (limited.avaliableGuest < table.minCapacity) {
    //                 table.isReachedLimit = true
    //                 return;
    //             }

    //             if (limited.avaliableGuest < table.maxCapacity) {
    //                 table.avaliableGuestWithLimit = limited.avaliableGuest
    //                 table.isAppliedLimit = true
    //                 console.log(meal_hours.hour, 'meal_hours.hour')
    //             } else {
    //                 table.avaliableGuestWithLimit = table.maxCapacity
    //             }




    //         })

    //         const result = TEST.map(r => {
    //             const table = tables.find(t => (t.id == r.table?.id && r.meal_hours?.hour == t.hour))
    //             return {
    //                 ...r,
    //                 table
    //             }
    //         })



    //         const limitations = await db.query.tblReservationLimitation.findMany({
    //             where: and(
    //                 eq(tblReservationLimitation.restaurantId, restaurantId),
    //                 eq(tblReservationLimitation.isActive, true),
    //             )
    //         })


    //         TEST.forEach(r => {
    //             if (r.reservation?.hour) {
    //                 r.reservation.hour = utcHourToLocalHour(r.reservation.hour)
    //             }
    //             if (r.meal_hours?.hour) {
    //                 r.meal_hours.hour = utcHourToLocalHour(r.meal_hours.hour)
    //             }
    //         })


    //         limitedAvailableHoursInfo.forEach(r => {
    //             if (r.hour) {
    //                 r.hour = utcHourToLocalHour(r.hour)
    //             }
    //         })

    //         limitations.forEach(r => {
    //             if (r.minHour) {
    //                 r.minHour = utcHourToLocalHour(r.minHour)
    //             }
    //             if (r.maxHour) {
    //                 r.maxHour = utcHourToLocalHour(r.maxHour)
    //             }
    //             if (r.hour) {
    //                 r.hour = utcHourToLocalHour(r.hour)
    //             }
    //         })



    //         return {
    //             result,
    //             TEST,
    //             tables,
    //             limitedAvailableHoursInfo,
    //             limitations
    //         }







    //         // return await ReservationEntities.getAllAvailableReservation()
    //     }),

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
            console.log(input.date, 'input.date')
            console.log(start, end, 'start', 'end')
            return await db.query.tblReservation.findMany({
                with: {
                    tables: {
                        with: {
                            table: true

                        }
                    }
                },
                where: and(
                    eq(tblReservation.restaurantId, restaurantId),
                    between(tblReservation.reservationDate, start, end)
                )
            })
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
        .query(async ({ input, ctx }) => {
            const { session: { user: { restaurantId } } } = ctx


            const { start, end } = getStartAndEndOfDay({
                date:
                    getLocalTime(input.date)
            })

            console.log(start, end, 's-e')

            const limitedAvailableHours = getAvaliabels(input).as('limitedAvailableHours')

            const limitedAvailableHoursInfo = await getAvaliabels(input)

            const TEST = await db
                .select()
                .from(tblRoom)
                .leftJoin(tblTable, eq(tblTable.roomId, tblRoom.id))
                .leftJoin(tblReservationTables, eq(tblReservationTables.tableId, tblTable.id))
                .leftJoin(tblReservation,
                    and(
                        eq(tblReservation.id, tblReservationTables.reservationId),
                        eq(tblReservation.mealId, input.mealId),
                        between(tblReservation.reservationDate, start, end)
                    )
                )
                .leftJoin(tblMealHours,
                    eq(tblMealHours.mealId, input.mealId)
                    // or(
                    //     isNull(tblReservation.id),
                    //     eq(tblReservation.hour, tblMealHours.hour),
                    // )
                ).leftJoin(tblGuest, eq(tblGuest.id, tblReservation.guestId))

                .where(and(
                    eq(tblRoom.restaurantId, 2),
                    isNotNull(tblTable.id),


                ))



            type NewTable = typeof TEST[0]['table'] & {
                isReserved: boolean
                isReachedLimit: boolean
                avaliableGuestWithLimit: number
                isAppliedLimit: boolean
                hour: string
            }


            const tables: NewTable[] = []

            TEST.forEach(rr => {
                if (!rr.table || !rr.meal_hours) return

                const reservation = rr.reservation ? { ...rr.reservation } : null
                const meal_hours = { ...rr.meal_hours }

                const table: NewTable = {
                    ...rr.table,
                    avaliableGuestWithLimit: rr.table.maxCapacity,
                    isReserved: false,
                    isReachedLimit: false,
                    isAppliedLimit: false,
                    hour: meal_hours.hour
                }
                tables.push(table)

                if (
                    (reservation)
                ) {
                    table.isReserved = true
                    return;
                }
                console.log(limitedAvailableHoursInfo, 'limitedAvailableHoursInfo')
                const limited = limitedAvailableHoursInfo.find(r => (r.hour === meal_hours.hour && r.room === table.roomId))
                console.log(Boolean(limited), 'limited')
                if (limited?.hour) {
                    console.log(limited?.hour, meal_hours.hour, 'limited hour')
                }
                if (!limited) return;

                if (limited.avaliableGuest < table.minCapacity) {
                    table.isReachedLimit = true
                    return;
                }

                if (limited.avaliableGuest < table.maxCapacity) {
                    table.avaliableGuestWithLimit = limited.avaliableGuest
                    table.isAppliedLimit = true
                    console.log(meal_hours.hour, 'meal_hours.hour')
                } else {
                    table.avaliableGuestWithLimit = table.maxCapacity
                }




            })

            const result = TEST.map(r => {
                const table = tables.find(t => (t.id == r.table?.id && r.meal_hours?.hour == t.hour))
                return {
                    ...r,
                    table
                }
            })

            const limitations = await db.query.tblReservationLimitation.findMany({
                where: and(
                    eq(tblReservationLimitation.restaurantId, restaurantId),
                    eq(tblReservationLimitation.isActive, true),
                )
            })


            result.forEach(r => {
                if (r.reservation?.hour) {
                    r.reservation.hour = utcHourToLocalHour(r.reservation.hour)
                }
                if (r.meal_hours?.hour) {
                    r.meal_hours.hour = utcHourToLocalHour(r.meal_hours.hour)
                }
                if(r.table?.hour){
                    r.table.hour = utcHourToLocalHour(r.table.hour)
                }
            })


            limitedAvailableHoursInfo.forEach(r => {
                if (r.hour) {
                    r.hour = utcHourToLocalHour(r.hour)
                }
            })

            limitations.forEach(r => {
                if (r.minHour) {
                    r.minHour = utcHourToLocalHour(r.minHour)
                }
                if (r.maxHour) {
                    r.maxHour = utcHourToLocalHour(r.maxHour)
                }
                if (r.hour) {
                    r.hour = utcHourToLocalHour(r.hour)
                }
            })



            




            return {
                result,
                TEST,
                tables,
                limitedAvailableHoursInfo,
                limitations
            }







            // return await ReservationEntities.getAllAvailableReservation()
        }),

});