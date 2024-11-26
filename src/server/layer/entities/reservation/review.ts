import { groupByWithKeyFn } from "@/lib/utils"
import { db } from "@/server/db"
import { tblGuest, tblReservation, tblReservationReview, tblReviewRating, TNewReservationReview, TNewReviewRating, TReservationReview } from "@/server/db/schema"
import { TPagination } from "@/server/types/types"
import { TTransaction } from "@/server/utils/db-utils"
import { getLocalTime, getStartAndEndOfDay } from "@/server/utils/server-utils"
import { EnumReviewStatus } from "@/shared/enums/predefined-enums"
import TReviewValidator, { reviewValidator } from "@/shared/validators/review"
import { and, asc, between, desc, eq, ne, or, SQL } from "drizzle-orm"

export const createUnClaimedReservationReview = async ({ trx, data }: { trx?: TTransaction, data: TNewReservationReview }) => {
    const database = trx || db
    const [result] = await database.insert(tblReservationReview).values(data).$returningId()
    if (!result) throw new Error('Error creating unclaimed review')
    return result.id
}

export const updateReservationReview = async ({
    reviewId,
    data,
    trx = db

}: { reviewId: number, data: Partial<TReservationReview>, trx?: TTransaction }) => {
    await trx.update(tblReservationReview).set(data).where(eq(tblReservationReview.id, reviewId))
}

export const createReviewRatings = async ({ data }: { data: TNewReviewRating[] }) => {
    await db.insert(tblReviewRating).values(data)
}






function generateQueryWithoutPagination(whereCondition: SQL<unknown> | undefined) {
    return db.select().from(tblReservation)
        .leftJoin(tblGuest, eq(tblReservation.guestId, tblGuest.id))
        .leftJoin(tblReservationReview, eq(tblReservation.id, tblReservationReview.reservationId))
        .leftJoin(tblReviewRating, eq(tblReservationReview.id, tblReviewRating.reservationReviewId))
        .where(whereCondition)
}

type TReviewWithPaginationRow = Awaited<ReturnType<typeof generateQueryWithoutPagination>>[number]

const mapReviewWithPaginationRow = (rows: TReviewWithPaginationRow[]) => {
    const grouped = groupByWithKeyFn(rows, (row) => row.reservation_review?.id)
    return Object.values(grouped).map((rows) => ({
        reservation_review: rows[0]?.reservation_review,
        reservation: rows[0]?.reservation,
        guest: rows[0]?.guest,
        reviewRatings: rows.map((row) => row.review_rating)
    }))
}

type TReviewPaginationRow = ReturnType<typeof mapReviewWithPaginationRow>[number]

export const reviewPagination = async ({
    restaurantId,
    paginationQuery
}: {
    restaurantId: number,
    paginationQuery: TReviewValidator.TReviewPaginationQuerySchema
}): Promise<TPagination<TReviewPaginationRow>> => {
    const { date } = paginationQuery.filters
    const { page, limit } = paginationQuery.pagination;
    const { global_search, sort } = paginationQuery;

    const andConditions: SQL<unknown>[] = []
    const orConditions: SQL<unknown>[] = []




    const orderBys: SQL<unknown>[] = []

    if (sort) {
        reviewValidator.reviewPaginationSortFields.forEach(field => {
            if (sort.sortField === field) {
                orderBys.push(sort.sortBy === 'desc' ? desc(tblReservationReview[field]) : asc(tblReservationReview[field]))
            }
        })
    }



    if (date) {
        const { start, end } = getStartAndEndOfDay({
            date: getLocalTime(date)

        })
        andConditions.push(between(tblReservation.reservationDate, start, end))
    }
    console.log(andConditions, 'andConditions')

    const whereCondition: SQL<unknown> | undefined = and(
        eq(tblReservationReview.restaurantId, restaurantId),
        ne(tblReservationReview.status, EnumReviewStatus.NOT_SENT),
        andConditions.length > 0 ? and(...andConditions) : undefined,
        orConditions.length > 0 ? or(...orConditions) : undefined
    )

    const query = generateQueryWithoutPagination(whereCondition)
        .limit(limit)
        .offset((page - 1) * limit)
        .orderBy(...orderBys);


    const result = await query;

    const totalCount = await generateQueryWithoutPagination(whereCondition).execute().then(res => res.length);
    const mapped = mapReviewWithPaginationRow(result)
    return {
        data: mapped,
        pagination: {
            page,
            limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit)
        }
    }
}