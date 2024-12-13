import { db } from "@/server/db"
import { tblPrepayment, TPrepayment, TPrepaymentInsert } from "@/server/db/schema"
import { TTransaction } from "@/server/utils/db-utils"
import { eq } from "drizzle-orm"

export const createReservationPrepayment = async ({
    data,
    trx = db
}: {
    data: TPrepaymentInsert,
    trx?: TTransaction
}) => {

    const newPrepayment = await trx.insert(tblPrepayment).values(data).$returningId()

    if (!newPrepayment) throw new Error('Failed to create prepayment')

    return newPrepayment[0]?.id!

}


export const updateReservationPrepayment = async ({
    data,
    trx = db
}: {
    data: Partial<TPrepayment> & { id: number },
    trx?: TTransaction
}) => {

    await trx.update(tblPrepayment).set(data).where(eq(tblPrepayment.id, data.id))

}

export const getCurrentPrepaymentById = async ({
    id
}: {
    id: number
}) => {
    const prepayment = await db.query.tblPrepayment.findFirst({
        where: eq(tblPrepayment.id, id)
    })
    

    return prepayment
}

export const getPrepaymentsByReservationId = async ({
    reservationId
}: {
    reservationId: number
}) => {
    const prepayments = await db.query.tblPrepayment.findMany({
        where: eq(tblPrepayment.reservationId, reservationId)
    })
    return prepayments
}


export const deleteReservationPrepayment = async ({
    id
}: {
    id: number
}) => {
    await db.delete(tblPrepayment).where(
        eq(tblPrepayment.id, id)
    )
}

