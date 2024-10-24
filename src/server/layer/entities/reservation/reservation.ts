
import { db } from "@/server/db";
import { tblReservationTables, TReservationInsert } from "@/server/db/schema";
import { tblReservation, TReservationSelect, TReservatioTable, TUpdateReservation } from "@/server/db/schema/reservation";
import { and, eq } from "drizzle-orm";







export const createReservation = async ({
    tableIds,
    ...data
}: TReservationInsert) => {
    const newReservation = await db.insert(tblReservation).values(data).$returningId()
    const reservationId = newReservation[0]?.id!
    await db.insert(tblReservationTables).values(tableIds.map(tableId => ({
        reservationId: reservationId,
        tableId: tableId,
    })))

    const reservation = await db.query.tblReservation.findFirst({
        where: eq(tblReservation.id, reservationId),
    })
    return reservation
}

export const updateReservation = async ({
    data,
    reservationId
}: {
    data: Partial<TReservationSelect>,
    reservationId: number
}) => {
    await db.update(tblReservation).set(data).where(
        eq(tblReservation.id, reservationId)
    )
}


export const addNewTablesToReservation = async (reservationTables: {
    reservationTables: {
        reservationId: number,
        tableId: number
    }[]
}) => {
    if (reservationTables.reservationTables.length === 0) return
    await db.insert(tblReservationTables).values(reservationTables.reservationTables)
}

export const removeTableFromReservation = async ({
    reservationId,
    reservationTableId
}: {
    reservationId: number,
    reservationTableId: number
}) => {
    await db.delete(tblReservationTables).where(
        and(
            eq(tblReservationTables.reservationId, reservationId),
            eq(tblReservationTables.id, reservationTableId)
        )
    )
}

export const linkReservation = async ({
    reservationId,
    linkedReservationId
}: {
    reservationId: number,
    linkedReservationId: number
}) => {
    await db.update(tblReservation).set({
        linkedReservationId: linkedReservationId
    }).where(
        eq(tblReservation.id, reservationId)
    )
}

export const unlinkReservation = async ({
    reservationId
}: {
    reservationId: number
}) => {
    await db.update(tblReservation).set({
        linkedReservationId: null
    }).where(
        eq(tblReservation.id, reservationId)
    )
}

export const updateReservationTable = async ({
    data
}: {
    data: Partial<TReservatioTable> & {
        id: number
    }
}) => {
    //update reservation table
    await db.update(tblReservationTables).set(data).where(
        eq(tblReservationTables.id, data.id)
    )
}


// export const updateReservattion=

// export const 