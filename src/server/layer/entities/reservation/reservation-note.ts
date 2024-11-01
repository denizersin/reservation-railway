


//crud reservation note

import { db } from "@/server/db";
import { tblReservationNote, TReservationNoteInsert } from "@/server/db/schema";
import { TTransaction } from "@/server/utils/db-utils";
import { eq } from "drizzle-orm";

export const createReservationNote = async ({
    reservationId,
    note,
    trx
}: {
    reservationId: number,
    note: string,
    trx?: TTransaction
}) => {
    const database = trx ?? db
    await database.insert(tblReservationNote).values({
        reservationId,
        note
    })
}

export const deleteReservationNoteById = async ({
    reservationNoteId,
    trx
}: {
    reservationNoteId: number,
    trx?: TTransaction
}) => {
    const database = trx ?? db
    await database.delete(tblReservationNote).where(eq(tblReservationNote.id, reservationNoteId))
}
