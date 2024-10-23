import { roomValidator } from "@/shared/validators/room";
import { createTRPCRouter, ownerProcedure } from "../trpc";
import { RoomEntities } from "@/server/layer/entities/room";
import { z } from "zod";
import { roomUseCases } from "@/server/layer/use-cases/room";

export const roomRouter = createTRPCRouter({
    createRoom: ownerProcedure
        .input(roomValidator.createRoomSchema)
        .mutation(async ({ input, ctx }) => {
            const { session: { user: { restaurantId } } } = ctx

            const createdRoom = await RoomEntities.createRoomWithTranslations({
                ...input,

                translations: input.translations,
                restaurantId
            });
            return createdRoom;
        }),

    updateRoom: ownerProcedure
        .input(roomValidator.updateRoomSchema)
        .mutation(async ({ input, ctx }) => {
            const { roomId, data } = input;
            const { session: { user: { restaurantId } } } = ctx
            await RoomEntities.updateRoomWithTranslations({
                roomId: roomId,
                data: {
                    ...data,

                }
            })
            return { success: true };
        }),

    getRoomDataById: ownerProcedure.input(z.object({
        roomId: z.number().positive()
    })).query(async ({ input }) => {

        const data = await RoomEntities.getRoomWithTranslations({ roomId: input.roomId })
        return data;
    }),
    getRooms: ownerProcedure
        .input(z.object({
            withWaitingRooms: z.boolean().optional()
        }))
        .query(async (opts) => {
            return await roomUseCases.getRooms(opts)
        }),
    getAllRooms: ownerProcedure.query(async (opts) => {
        return await roomUseCases.getRooms({
            ctx: opts.ctx,
            input: { withWaitingRooms: true }
        })
    }),
    createTable: ownerProcedure
        .input(roomValidator.createRoomTableSchema)
        .mutation(async ({ input, ctx }) => {
            await roomUseCases.createTables(input)
        }),
    getTables: ownerProcedure
        .input(z.object({
            roomId: z.number().positive()
        }))
        .query(async ({ input }) => {
            const data = await RoomEntities.getTablesByRoomId({ roomId: input.roomId })
            return data;
        }),
    updateTable: ownerProcedure
        .input(roomValidator.updateRoomTableSchema)
        .mutation(async ({ input }) => {
            const { tableId, data } = input
            await RoomEntities.updateTable({
                id: tableId,
                ...data,
            })
        }),
    updateMultipleTables: ownerProcedure
        .input(roomValidator.updateMultipleTablesSchema)
        .mutation(async ({ input }) => {
            await RoomEntities.updateMultipleTables(input.data.map(({ data, tableId }) => ({
                id: tableId,
                ...data
            })))
        }),
    deleteTable: ownerProcedure
        .input(z.object({
            tableId: z.number().positive()
        }))
        .mutation(async ({ input }) => {
            await RoomEntities.deleteTableById({ tableId: input.tableId })
        }),
});


