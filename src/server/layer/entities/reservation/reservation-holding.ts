import { db } from "@/server/db";
import { tblReservationHolding, TReservationHoldingInsert } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const createReservationHolding = async ({ reservationHoldingData }: {
    reservationHoldingData: TReservationHoldingInsert
}) => {
    const [result] = await db.insert(tblReservationHolding).values(reservationHoldingData).$returningId();
    return result?.id
}

export const deleteReservationHoldingById = async ({ id }: { id: number }) => {
    await db.delete(tblReservationHolding).where(eq(tblReservationHolding.id, id));
}

export const getReservationByHoldingTableId = async ({ holdedTableId }: { holdedTableId: number }) => {
    const result = await db.query.tblReservationHolding.findFirst({
        where: eq(tblReservationHolding.holdedTableId, holdedTableId)
    })
    return result
}