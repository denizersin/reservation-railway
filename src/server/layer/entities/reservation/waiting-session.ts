import { db } from "@/server/db";
import { tblReservation, tblWaitingSessionTables, tblWaitingTableSession, TWaitingTableSession } from "@/server/db/schema/reservation";
import { TTransaction } from "@/server/utils/db-utils";
import { eq } from "drizzle-orm";




export const createReservationWaitingSession = async ({
    reservationId,
    tableIds
}: {
    reservationId: number,
    tableIds: number[]
}) => {

    const reservation = await db.query.tblReservation.findFirst({
        where: eq(tblReservation.id, reservationId)
    })

    if (!reservation) return

    const waitingSessionId = reservation.waitingSessionId!

    await db.insert(tblWaitingSessionTables).values(tableIds.map(tableId => ({
        waitingSessionId: waitingSessionId,
        tableId: tableId
    })))

}

export const updateReservationWaitingSessionWithTables = async ({
    reservationId,
    tableIds
}: {
    reservationId: number,
    tableIds: number[]
}) => {
    const waitingSession = await db.query.tblWaitingTableSession.findFirst({
        where: eq(tblWaitingTableSession.reservationId, reservationId)
    })
    if (!waitingSession) return
    const waitingSessionId = waitingSession.id
    await db.delete(tblWaitingSessionTables).where(
        eq(tblWaitingSessionTables.waitingSessionId, waitingSessionId)
    )
    if (tableIds.length === 0) return

    await db.insert(tblWaitingSessionTables).values(tableIds.map(tableId => ({
        waitingSessionId: waitingSessionId,
        tableId: tableId
    })))

}

export const updateReservationWaitingSession = async ({
    waitingSessionId,
    data
}: {
    waitingSessionId: number,
    data: Partial<TWaitingTableSession>
}) => {
    await db.update(tblWaitingTableSession).set(data).where(
        eq(tblWaitingTableSession.id, waitingSessionId)
    )
}



export const createUnClaimedReservationWaitingSession = async ({
    trx
}: {
    trx?: TTransaction
}) => {

    const database = trx || db

    const [result] = await database.insert(tblWaitingTableSession).values({
        reservationId: null,
    }).$returningId()
    if (!result) throw new Error('Error creating waiting session')
    return result.id
}

export const updateUnClaimedReservationWaitingSession = async ({
    data,
    waitingSessionId,
    trx
}: {
    data: Partial<TWaitingTableSession>
    waitingSessionId: number,
    trx?: TTransaction
}) => {
    const database = trx || db
    await database.update(tblWaitingTableSession).set(data).where(
        eq(tblWaitingTableSession.id, waitingSessionId)
    )
}

export const getReservationById = async ({
    reservationId
}: {
    reservationId: number
}) => {
    const reservation = await db.query.tblReservation.findFirst({
        where: eq(tblReservation.id, reservationId)
    })
    if (!reservation) throw new Error('Reservation not found')
    return reservation!
}