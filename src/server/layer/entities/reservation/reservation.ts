
import { db } from "@/server/db";
import { tblPrepayment, tblReservationTable, tblReservationTag, tblRestaurantTagTranslation, tblRoom, tblRoomTranslation, tblTable, TReservationInsert, TTable } from "@/server/db/schema";
import { tblReservation, TReservationSelect, TReservatioTable, TUpdateReservation, tblWaitingTableSession, tblWaitingSessionTables, TWaitingTableSession } from "@/server/db/schema/reservation";
import { TTransaction } from "@/server/utils/db-utils";
import { and, between, desc, eq, isNotNull, isNull, ne } from "drizzle-orm";
import { RoomEntities } from "../room";
import { EnumReservationStatusNumeric } from "@/shared/enums/predefined-enums";
import { getLocalTime, getStartAndEndOfDay, utcHourToLocalHour } from "@/server/utils/server-utils";
import { ReservationEntities } from ".";






export const createReservation = async ({
    tableIds,
    data,
    trx = db
}: {
    data: Omit<TReservationInsert, 'waitingSessionId' | 'reviewId'>,
    tableIds: number[],
    trx?: TTransaction
}) => {

    const newUnclaimedWaitingSessionId = await ReservationEntities.createUnClaimedReservationWaitingSession({ trx })
    const newUnclaimedReviewId = await ReservationEntities.createUnClaimedReservationReview({
        trx, data: {
            restaurantId: data.restaurantId,
            guestId: data.guestId,
        }
    })
    const newReservation = await trx.insert(tblReservation).values({
        ...data,
        waitingSessionId: newUnclaimedWaitingSessionId,
        reviewId: newUnclaimedReviewId
    }).$returningId()



    const reservationId = newReservation[0]?.id!
    await trx.insert(tblReservationTable).values(tableIds.map(tableId => ({
        reservationId: reservationId,
        tableId: tableId,

    })))

    await ReservationEntities.updateUnClaimedReservationWaitingSession({
        waitingSessionId: newUnclaimedWaitingSessionId,
        data: {
            reservationId: reservationId,
        },
        trx
    })

    await ReservationEntities.updateReservationReview({
        reviewId: newUnclaimedReviewId,
        data: {
            reservationId: reservationId,
        },
        trx
    })

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
    data: Partial<TReservationSelect> &{
        tagIds?: number[],
    },
    reservationId: number,
    trx?: TTransaction
}) => {
    await trx.update(tblReservation).set(data).where(
        eq(tblReservation.id, reservationId)
    )
    if (data.tagIds && data.tagIds?.length) {
        await trx.delete(tblReservationTag).where(
            eq(tblReservationTag.reservationId, reservationId)
        )
        await trx.insert(tblReservationTag).values(data.tagIds.map(tagId => ({
            reservationId: reservationId,
            tagId: tagId,
        })))
    }
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



export const getReservationDetail = async ({
    reservationId,
    languageId
}: {
    reservationId: number,
    languageId: number
}) => {
    const reservation = await db.query.tblReservation.findFirst({
        where: eq(tblReservation.id, reservationId),
        with: {
            tables: {
                with: {
                    table: true,
                }
            },
            room: {
                with: {
                    translations: {
                        where: eq(tblRoomTranslation.languageId, languageId)
                    }
                }
            },
            guest: true,
            reservationStatus: true,
            reservationExistenceStatus: true,
            reservationNotes: true,
            logs: true,
            notifications: true,
            currentPrepayment: true,
            prepayments: {
                orderBy: [desc(tblPrepayment.createdAt)]
            },

            meal: true,
            assignedPersonal: true,
            tags: {
                with: {
                    tag:{
                        with: {
                            translations: {
                                where: eq(tblRestaurantTagTranslation.languageId, languageId)
                            }
                        }
                    }
                }
            },
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



    await db.transaction(async (trx) => {

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



export const deletePrepayment = async ({
    reservationId,
    trx = db
}: {
    reservationId: number,
    trx?: TTransaction
}) => {
    await trx?.delete(tblPrepayment).where(eq(tblPrepayment.reservationId, reservationId))
}




export const getReservationStatusData = async ({
    reservationId,
    languageId
}: {
    reservationId: number,
    languageId: number
}) => {


    const result = await db.query.tblReservation.findFirst({
        where: eq(tblReservation.id, reservationId),
        with: {
            guest: true,
            currentPrepayment: true,
            reservationStatus: true,
            review: true
        }
    })

    if (!result) throw new Error('Reservation not found')
    const roomName = await db.query.tblRoomTranslation.findFirst({
        where: eq(tblRoomTranslation.languageId, languageId)
    })

    result.hour = utcHourToLocalHour(result.hour)

    const resultWithRoomName = {
        ...result,
        roomName: roomName?.name
    }

    return resultWithRoomName


}

export const queryTableAvailability = async ({
    restaurantId,
    date,
    mealId,
    tableId
}: {
    restaurantId: number,
    date: Date,
    mealId: number,
    tableId: number
}): Promise<boolean> => {

    const { start, end } = getStartAndEndOfDay({
        date: getLocalTime((new Date(date)))
    })
    console.log(start, end, 'start end')

    const getReservationTables = () => db
        .select({
            RESERVATION_TABLE_ID: tblReservationTable.id,
            RESERVATION_ID: tblReservationTable.reservationId,
            TABLE_ID: tblReservationTable.tableId,
        })
        .from(tblReservation)
        .leftJoin(tblReservationTable, eq(tblReservationTable.reservationId, tblReservation.id))
        .where(
            and(
                eq(tblReservation.mealId, mealId),
                between(tblReservation.reservationDate, start, end),
                ne(tblReservation.reservationStatusId, EnumReservationStatusNumeric.cancel),
                ne(tblReservation.reservationStatusId, EnumReservationStatusNumeric.completed)

            )
        )

    const reservationTables = getReservationTables().as('reservationTables')

    const TEST = await db
        .select()
        .from(tblRoom)
        .leftJoin(tblTable, eq(tblTable.roomId, tblRoom.id))
        .leftJoin(reservationTables, eq(reservationTables.TABLE_ID, tblTable.id))
        .leftJoin(tblReservation, and(
            eq(tblReservation.id, reservationTables.RESERVATION_ID),
        ))
        .leftJoin(tblReservationTable, eq(tblReservationTable.id, reservationTables.RESERVATION_TABLE_ID))
        .where(and(
            eq(tblTable.id, tableId),
            eq(tblRoom.restaurantId, restaurantId),
            eq(tblRoom.isWaitingRoom, false),
            isNotNull(tblTable.id),
            isNull(tblReservation.id),

        ))

    const isTableAvaliable = TEST.length === 0

    return isTableAvaliable

}

