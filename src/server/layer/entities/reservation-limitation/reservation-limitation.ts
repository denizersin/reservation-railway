import { db } from "@/server/db"
import { tblPermanentLimitation, tblReservationLimitation, TPermanentLimitationInsert, TReservationLimitation, TReservationLimitationInsert } from "@/server/db/schema/resrvation_limitation"
import { formatTimeWithoutSeconds, utcHourToLocalHour } from "@/server/utils/server-utils"
import { and, eq } from "drizzle-orm"

export const createLimitation = async ({
    limitationData
}: {
    limitationData: TReservationLimitationInsert
}) => {
    await db.insert(tblReservationLimitation).values({
        ...limitationData,
    })
}

export const updateLimitation = async (newData:
    Partial<TReservationLimitation> & {
        id: number
    }
) => {

    await db.update(tblReservationLimitation).set({
        ...newData,
    }).where(
        and(
            eq(tblReservationLimitation.id, newData.id),
        )
    )

}


export const getLimitations = async ({
    restaurantId
}: {
    restaurantId: number
}) => {
    const data = await db.query.tblReservationLimitation.findMany({
        with: {
            meal: true,
            room: {
                with: {
                    translations: true
                }
            }
        },
        where: eq(tblReservationLimitation.restaurantId, restaurantId)
    })
    return data.map(limitation => ({
        ...limitation,
        hour: utcHourToLocalHour(formatTimeWithoutSeconds(limitation.maxHour))
    }))
}

export const deleteLimitationById = async ({
    limitationId
}: {
    limitationId: number
}) => {
    await db.delete(tblReservationLimitation).where(
        and(
            eq(tblReservationLimitation.id, limitationId),
        )
    )
}



export const createPermanentLimitation = async ({
    permanentLimitationData
}: {
    permanentLimitationData: TPermanentLimitationInsert
}) => {
    await db.insert(tblPermanentLimitation).values({
        ...permanentLimitationData,
    })
}

export const deletePermanentLimitationById = async ({
    limitationId
}: {
    limitationId: number
}) => {
    await db.delete(tblPermanentLimitation).where(
        and(
            eq(tblPermanentLimitation.id, limitationId),
        )
    )
}

export const getPermanentLimitations = async ({
    restaurantId
}: {
    restaurantId: number
}) => {
    const data = await db.query.tblPermanentLimitation.findMany({
        with: {
            room: {
                with: {
                    translations: true
                }
            }
        },
        where: eq(tblPermanentLimitation.restaurantId, restaurantId)
    })
    return data
}

