import { db } from "@/server/db";
import { tblWaitlist, TWaitlist, TWaitlistInsert } from "@/server/db/schema/waitlist";
import { getLocalTime, getStartAndEndOfDay } from "@/server/utils/server-utils";

import { and, between, eq, isNull } from "drizzle-orm";

import { TRPCError } from "@trpc/server";
import { getStatusWithLimitation } from "../../use-cases/reservation/client-queries";

export const createWaitlist = async (data: TWaitlistInsert) => {
    try {
        const waitlist = await db.insert(tblWaitlist).values(data).$returningId()
        return waitlist[0]?.id!
    } catch (error) {
        console.log(error, 'error')
        throw new TRPCError({
            code: 'BAD_GATEWAY',
            message: 'Waitlist creation failed'
        })
    }
}

export const getWaitlistById = async ({ waitlistId }: { waitlistId: number }) => {
    const waitlist = await db.select().from(tblWaitlist).where(eq(tblWaitlist.id, waitlistId))
    if (!waitlist.length) {
        throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Waitlist not found'
        })
    }
    return waitlist[0]!
}

export const updateWaitlist = async ({
    id,
    data
}: {
    id: number,
    data: Partial<Omit<TWaitlist, 'id'>>
}) => {
    await db.update(tblWaitlist).set(data).where(eq(tblWaitlist.id, id))
}

export const getWailtists = async ({ restaurantId, date }: {
    restaurantId: number
    date: Date
}) => {
    const { start, end } = getStartAndEndOfDay({
        date:
            getLocalTime(date)
    })

    const waitlist = await db.query.tblWaitlist.findMany({
        where: and(
            between(tblWaitlist.waitlistDate, start, end),
            eq(tblWaitlist.restaurantId, restaurantId),
            isNull(tblWaitlist.assignedReservationId)
        ),
        with: {
            guest: true
        }
    })
    return waitlist
    // return waitlist
}

export const deleteWaitlist = async ({ waitlistId }: { waitlistId: number }) => {
    await db.delete(tblWaitlist).where(eq(tblWaitlist.id, waitlistId))
}



export const getWaitlistStatues = async ({ restaurantId, date }: { restaurantId: number, date: Date }) => {

    const { start, end } = getStartAndEndOfDay({
        date:
            getLocalTime(date)
    })

    const waitlists = await db.select().from(tblWaitlist).where(and(
        between(tblWaitlist.waitlistDate, start, end),
        eq(tblWaitlist.restaurantId, restaurantId),
    ))


    const wailistStatuesRow: (TWaitlist & {
        isAvailable: boolean
    })[] = [];

    for (const waitlist of waitlists) {
        const statusWithLimitation = await getStatusWithLimitation({
            date: waitlist.waitlistDate,
            mealId: waitlist.mealId,
            restaurantId,
            guestCount: waitlist.guestCount
        })

        wailistStatuesRow.push({
            ...waitlist,
            isAvailable: statusWithLimitation[0]?.avaliableGuest! > 0
        })
    }

    return wailistStatuesRow

}



export const getWaitlistMessageInstance = async ({ waitlistId }: { waitlistId: number }) => {
    const waitlist = await db.query.tblWaitlist.findFirst({
        where: eq(tblWaitlist.id, waitlistId),
        with: {
            guest: true,
            restaurant: true,
            notifications: true
        }
    })

    if (!waitlist) {
        throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Waitlist not found'
        })
    }
    return waitlist
}