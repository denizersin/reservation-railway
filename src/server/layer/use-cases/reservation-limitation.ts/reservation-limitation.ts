import { db } from "@/server/db"
import { tblPermanentLimitation, tblReservationLimitation, TPermanentLimitation, TPermanentLimitationInsert, TReservationLimitationInsert } from "@/server/db/schema/resrvation_limitation"
import { localHourToUtcHour } from "@/server/utils/server-utils"
import { parseISO } from "date-fns"

export const createLimitation = async ({
    limitationData
}: {
    limitationData: Omit<TReservationLimitationInsert, 'minHour' | 'maxHour'> & {
        hour: string
    }
}) => {

    limitationData.hour=localHourToUtcHour(limitationData.hour)

    await db.insert(tblReservationLimitation).values({
        ...limitationData,
        minHour: limitationData.hour,
        maxHour: limitationData.hour
    })
}


export const createPermanentLimitation = async ({
    permanentLimitationData
}: {
    permanentLimitationData: TPermanentLimitationInsert
}) => {

    const startDate = ((permanentLimitationData.startDate))
    const endDate = ((permanentLimitationData.endDate))


    await db.insert(tblPermanentLimitation).values({
        ...permanentLimitationData,
        startDate,
        endDate
    })
}

