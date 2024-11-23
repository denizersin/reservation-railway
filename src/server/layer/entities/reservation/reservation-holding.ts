import { db } from "@/server/db";
import { tblReservation, tblReservationHolding, tblReservationTable, TReservationHoldingInsert } from "@/server/db/schema";
import { EnumReservationStatusNumeric } from "@/shared/enums/predefined-enums";
import { and, eq } from "drizzle-orm";
import { RoomEntities } from "../room";
import { ReservationEntities } from ".";
import { TRPCError } from "@trpc/server";



export const getReservationHoldingByTableId = async ({ holdedReservationTableId }: { holdedReservationTableId: number }) => {

    const resrvationTable = await db.query.tblReservationTable.findFirst({
        where: and(eq(tblReservationTable.tableId, holdedReservationTableId))
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



//delete holding reservation by holding reservation id
export const deleteHoldedReservationById = async ({ holdedReservationId }: { holdedReservationId: number }) => {
    await db.delete(tblReservation).where(and(
        eq(tblReservation.id, holdedReservationId),
        eq(tblReservation.reservationStatusId, EnumReservationStatusNumeric.holding)
    ))
}

export const getHoldedReservationById = async ({ holdedReservationId }: { holdedReservationId: number }) => {
    return await db.query.tblReservation.findFirst({
        where: and(eq(tblReservation.id, holdedReservationId), eq(tblReservation.reservationStatusId, EnumReservationStatusNumeric.holding))
        
    })
}