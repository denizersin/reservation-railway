import { db } from "@/server/db";
import { tblReservation, tblReservationHolding, tblReservationTable, TReservationHoldingInsert } from "@/server/db/schema";
import { EnumReservationStatusNumeric } from "@/shared/enums/predefined-enums";
import { and, eq } from "drizzle-orm";
import { RoomEntities } from "../room";



export const getReservationHoldingByTableId = async ({ holdedTableId }: { holdedTableId: number }) => {

    const resrvationTable = await db.query.tblReservationTable.findFirst({
        where: and(eq(tblReservationTable.tableId, holdedTableId))
    })

    if (!resrvationTable) return undefined

    const result = await db.query.tblReservation.findFirst({
        where: and(
            eq(tblReservation.id, resrvationTable.reservationId),
            eq(tblReservation.reservationStatusId, EnumReservationStatusNumeric.holding)
        )
    })

    const table = await RoomEntities.getTableById({ tableId: resrvationTable.tableId })

    return {
        reservation: result,
        table: table
    }
}

export const deleteHoldedReservationById = async ({ reservationId }: { reservationId: number }) => {
    try {
        await db.delete(tblReservation).where(eq(tblReservationHolding.id, reservationId))
    } catch (error) {
        console.log('deleteHoldedRese')
        console.log(error)
    }
}

export const deleteHoldedReservationByOccupiedTableId = async ({ holdedTableId }: { holdedTableId: number }) => {

    const resrvationTable = await db.query.tblReservationTable.findFirst({
        where: and(eq(tblReservationTable.tableId, holdedTableId))
    })

    if (!resrvationTable) return undefined

    await db.delete(tblReservation).where(eq(tblReservation.id, resrvationTable.reservationId))
}