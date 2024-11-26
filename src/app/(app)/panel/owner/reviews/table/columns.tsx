"use client"

import { createColumnHelper, type ColumnDef } from "@tanstack/react-table"
import { RestaurantReviewRow, ReviewPaginationRow } from "../page"
import { IconCalendarClock, IconMessageCircle } from "@tabler/icons-react"



export const columns: ColumnDef<ReviewPaginationRow, any>[] = [
    {
        accessorKey: 'asd',
        id: 'score',
        header: () => {
            return <div>Reservasyon</div>
        },
        cell: ({ row }) => {
            const reservation = row.original.reservation
            const guest = row.original.guest
            const review = row.original.reservation_review
            return <div>
                <div>
                    {guest?.name} - {guest?.surname}
                </div>
                <div className="flex gap-2">
                    <div className="flex gap-2 items-center">
                        <IconMessageCircle size={18} />
                        <span>{review?.reviewedAt?.toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-2 items-center">
                        <IconCalendarClock size={18} />
                        <span>{reservation?.reservationDate?.toLocaleDateString()}</span>
                    </div>
                </div>
                <div className="text-sm mt-2">
                    {review?.guestReview}
                </div>

            </div>
        },
    },

    {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => {
            console.log(row.original, 'row')
            const review = row.original.reservation_review
            return <div className="flex items-center gap-2">
                <span>{review?.status}</span>
            </div>
        },
    },
    {
        header: () => <span>Score</span>,
        id: 'actions',
        cell: ({ row }) => <span>{row.original.reservation_review?.reviewScore}</span>,
    },
]



export const getRestaurantReviewColumns = (reviews: RestaurantReviewRow[]) => {
    return reviews.map((review) => ({
        accessorKey: review.id.toString(),
        id: review.id.toString(),
        header: review?.translations[0]?.title ?? '',
        cell: ({ row }) => {

            const reviewRatings = row.original.reviewRatings;
            const reviewScore = reviewRatings.find((rating) => rating?.restaurantReviewId === review.id)?.rating;
            return <span>{reviewScore}</span>
        },
    })) as ColumnDef<ReviewPaginationRow, any>[]
}