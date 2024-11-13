import { db } from "@/server/db";
import { tblReservationTable, TReservatioTable } from "@/server/db/schema";
import { tblRoom, tblRoomTranslation, tblTable, TRoomInsertWithTranslations, TRoomUpdateWithTranslations, TRoomWithTranslations, TTable, TTableInsert } from "@/server/db/schema/room";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";


export const createRoomWithTranslations = async ({
    translations,
    ...roomFields
}: TRoomInsertWithTranslations) => {
    //create room with translations
    const [result] = await db.insert(tblRoom).values(roomFields).$returningId()

    if (!result?.id) {
        throw new TRPCError({ message: 'Room not created', code: 'BAD_REQUEST' })
    }
    const roomId = result.id

    await db.insert(tblRoomTranslation).values(translations.map(t => ({ ...t, roomId })))

    // Change the return statement to return the created room
}

export const createWaitingRoom = async ({
    translations,
    ...roomFields
}: TRoomInsertWithTranslations) => {
    //create room with translations

    // const [result] = await db.insert(tblWaitingRoom).values({
    //     name: translations[0]?.name!,
    //     restaurantId: roomFields.restaurantId
    // }).$returningId()

    // if (!result?.id) {
    //     throw new TRPCError({ message: 'Room not created', code: 'BAD_REQUEST' })
    // }

}

export const updateRoomWithTranslations = async ({
    data,
    roomId
}: {
    data: Partial<TRoomUpdateWithTranslations>,
    roomId: number
}) => {
    //update room with translations
    await db.update(tblRoom).set(data).where(
        eq(tblRoom.id, roomId)
    )
    if (data?.translations) {
        await db.delete(tblRoomTranslation).where(
            eq(tblRoomTranslation.roomId, roomId)
        )
        await db.insert(tblRoomTranslation).values(data.translations.map(t => ({ ...t, roomId })))
    };


}

export const getRoomWithTranslations = async ({
    roomId
}: {
    roomId: number
}): Promise<TRoomWithTranslations> => {

    const data = await db.query.tblRoom.findFirst({
        where: eq(tblRoom.id, roomId),
        with: {
            translations: true
        }
    })
    if (!data) {
        throw new TRPCError({ message: 'Room not found', code: 'BAD_REQUEST' })
    }
    return data


}


export const getRooms = async ({
    restaurantId,
    languageId,
    withWaitingRooms
}: {
    restaurantId: number
    languageId: number
    withWaitingRooms?: boolean
}): Promise<TRoomWithTranslations[]> => {
    return await db.query.tblRoom.findMany({
        where: and(
            eq(tblRoom.restaurantId, restaurantId),
            withWaitingRooms ? undefined :
                eq(tblRoom.isWaitingRoom, false)
        ),
        with: {
            translations: {
                where: eq(tblRoomTranslation.languageId, languageId)
            }
        }
    })

}

export const createTables = async ({
    tables
}: {
    tables: TTableInsert[]

}) => {
    //create table
    if (tables.length === 0) {
        throw new TRPCError({ message: 'Table not found', code: 'BAD_REQUEST' })
    }
    await db.insert(tblTable).values(tables)
}

export const deleteTableById = async ({
    tableId
}: {
    tableId: number
}) => {
    //delete table
    await db.delete(tblTable).where(
        eq(tblTable.id, tableId)
    )
}

export const updateTable = async (data: Partial<TTable> & { id: number }) => {
    //update table
    await db.update(tblTable).set(data).where(
        eq(tblTable.id, data.id)
    )
}

export const updateMultipleTables = async (data: (Partial<TTable> & { id: number }[])) => {
    //update multiple tables
    await Promise.all(
        data.map(async (d) =>
            await updateTable(d)
        )
    )
}

export const getTablesByRoomId = async ({
    roomId
}: {
    roomId: number
}) => {
    //get all tables
    const tables = await db.query.tblTable.findMany({
        where: eq(tblTable.roomId, roomId)
    })
    return tables
}



export const getTableById = async ({
    tableId
}: {
    tableId: number
}) => {
    const table = await db.query.tblTable.findFirst({ where: eq(tblTable.id, tableId) })
    if (!table) {
        throw new TRPCError({ message: 'Table not found', code: 'BAD_REQUEST' })
    }
    return table
}
