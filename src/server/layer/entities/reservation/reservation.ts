
import { db } from "@/server/db";
import { tblPrepayment, tblReservationTable, TReservationInsert } from "@/server/db/schema";
import { tblReservation, TReservationSelect, TReservatioTable, TUpdateReservation, tblWaitingTableSession, tblWaitingSessionTables, TWaitingTableSession } from "@/server/db/schema/reservation";
import { tblConfirmationRequest, TConfirmationRequestInsert } from "@/server/db/schema/reservation/confirmation-request";
import { createTransaction, TTransaction } from "@/server/utils/db-utils";
import { and, eq } from "drizzle-orm";
import { RoomEntities } from "../room";






export const createReservation = async ({
    tableIds,
    ...data
}: TReservationInsert) => {
    const newReservation = await db.insert(tblReservation).values({
        ...data,
    }).$returningId()

    const reservationId = newReservation[0]?.id!
    await db.insert(tblReservationTable).values(tableIds.map(tableId => ({
        reservationId: reservationId,
        tableId: tableId,

    })))

    const reservation = await db.query.tblReservation.findFirst({
        where: eq(tblReservation.id, reservationId),
    })
    return reservation!
}

export const updateReservation = async ({
    data,
    reservationId,
    trx = db
}: {
    data: Partial<TReservationSelect>,
    reservationId: number,
    trx?: TTransaction
}) => {
    await trx.update(tblReservation).set(data).where(
        eq(tblReservation.id, reservationId)
    )
}


export const updateReservationStatus = async ({
    reservationId,
    reservationStatusId
}: {
    reservationId: number,
    reservationStatusId: number
}) => {
    await db.update(tblReservation).set({
        reservationStatusId: reservationStatusId
    }).where(
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
    await db.insert(tblReservationTable).values(reservationTables.reservationTables)
}

export const removeTableFromReservation = async ({
    reservationId,
    reservationTableId
}: {
    reservationId: number,
    reservationTableId: number
}) => {
    await db.delete(tblReservationTable).where(
        and(
            eq(tblReservationTable.reservationId, reservationId),
            eq(tblReservationTable.id, reservationTableId)
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
    data,
    trx = db
}: {
    data: Partial<TReservatioTable> & {
        id: number
    },
    trx?: TTransaction
}) => {
    //update reservation table
    await trx.update(tblReservationTable).set(data).where(
        eq(tblReservationTable.id, data.id)
    )
}

export const createConfirmationRequest = async ({
    data,
    trx = db
}: {
    data: TConfirmationRequestInsert,
    trx?: TTransaction
}) => {
    await trx?.insert(tblConfirmationRequest).values(data)
}


export const getReservationDetail = async ({
    reservationId
}: {
    reservationId: number
}) => {
    const reservation = await db.query.tblReservation.findFirst({
        where: eq(tblReservation.id, reservationId),
        with: {
            tables: {
                with: {
                    table: true,
                }
            },
            room: true,
            guest: true,
            reservationStatus: true,
            reservationExistenceStatus: true,
            reservationNotes: true,
            logs: true,
            notifications: true,
            prepayment: true,
            meal: true,
            assignedPersonal: true,
            tags: true,
            waitingSession: {
                with: {
                    tables: {
                        with: {
                            table: true
                        }
                    }
                }
            },
            billPayment: true,
            createdOwner: true,
            confirmationRequests: true

        }
    })

    if (!reservation) throw new Error('Reservation not found')
    return reservation
}

//reset reservation tables and links
//this is used when changing reservation time or change room
export const resetReservationTablesAndLinks = async ({
    reservationId,
    tableId,
}: {
    reservationId: number,
    tableId: number
}) => {



    createTransaction(async (trx) => {

        const table = await RoomEntities.getTableById({ tableId })

        await trx.delete(tblReservationTable).where(
            eq(tblReservationTable.reservationId, reservationId),
        )

        await trx.update(tblReservation).set({
            linkedReservationId: null
        }).where(
            eq(tblReservation.linkedReservationId, reservationId)
        )

        await trx.insert(tblReservationTable).values({
            reservationId: reservationId,
            tableId: table.id,
        })

        await trx.update(tblReservation).set({
            roomId: table.roomId,
        }).where(
            eq(tblReservation.id, reservationId)
        )


    })

}

export const geTReservationMessageInstance = async ({
    reservationId
}: {
    reservationId: number
}) => {
    const reservation = await db.query.tblReservation.findFirst({
        where: eq(tblReservation.id, reservationId),
        with: {
            guest: true,
            restaurant: true
        }
    })
    if (!reservation) throw new Error('Reservation not found')
    return reservation
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

export const deletePrepayment = async ({
    reservationId,
    trx = db
}: {
    reservationId: number,
    trx?: TTransaction
}) => {
    await trx?.delete(tblPrepayment).where(eq(tblPrepayment.reservationId, reservationId))
}