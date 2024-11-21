import { db } from "@/server/db"
import { tblConfirmationRequest, TConfirmationRequest, TConfirmationRequestInsert } from "@/server/db/schema"
import { TTransaction } from "@/server/utils/db-utils"
import { eq } from "drizzle-orm"

export const createConfirmationRequest = async ({
    data,
    trx = db
}: {
    data: TConfirmationRequestInsert,
    trx?: TTransaction
}) => {
    const newRequest = await trx.insert(tblConfirmationRequest).values(data).$returningId()

    if (!newRequest) throw new Error('Failed to create confirmation request')

    return newRequest[0]?.id!
}

export const updateConfirmationRequest = async ({
    data,
    trx = db
}: {
    data: Partial<TConfirmationRequest> & { id: number },
    trx?: TTransaction
}) => {
    await trx.update(tblConfirmationRequest)
        .set(data)
        .where(eq(tblConfirmationRequest.id, data.id))
}

export const getConfirmationRequestById = async ({
    id
}: {
    id: number
}) => {
    const request = await db.query.tblConfirmationRequest.findFirst({
        where: eq(tblConfirmationRequest.id, id)
    })
    
    return request
}

export const getConfirmationRequestsByReservationId = async ({
    reservationId
}: {
    reservationId: number
}) => {
    const requests = await db.query.tblConfirmationRequest.findMany({
        where: eq(tblConfirmationRequest.reservationId, reservationId)
    })
    return requests
}

export const deleteConfirmationRequest = async ({
    id
}: {
    id: number
}) => {
    await db.delete(tblConfirmationRequest).where(
        eq(tblConfirmationRequest.id, id)
    )
}


export const deleteReservationConfirmationRequests = async ({
    reservationId,
    trx = db
}: {
    reservationId: number,
    trx?: TTransaction
}) => {
    await trx?.delete(tblConfirmationRequest).where(eq(tblConfirmationRequest.reservationId, reservationId))
}