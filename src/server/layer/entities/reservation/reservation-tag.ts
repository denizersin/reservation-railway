import { db } from "@/server/db"
import { tblReservationTag } from "@/server/db/schema"
import { and, eq } from "drizzle-orm"
import { TTransaction } from "@/server/utils/db-utils"

export const createReservationTags = async ({
    reservationId,
    reservationTagIds,
    trx = db
}: {
    reservationId: number,
    reservationTagIds: number[],
    trx?: TTransaction
}) => {

    await trx.insert(tblReservationTag).values(reservationTagIds.map(reservationTagId => ({
        reservationId,
        tagId: reservationTagId
    })))

}

export const deleteReservationTagById = async ({
    reservationTagId,
    trx = db
}: {
    reservationTagId: number,
    trx?: TTransaction
}) => {

    await trx.delete(tblReservationTag).where(eq(tblReservationTag.id, reservationTagId))
}
