"use client"
import React, { useEffect, useState } from 'react'

import { api, RouterOutputs } from '@/server/trpc/react';
import TReviewValidator from '@/shared/validators/review';
import { DEFAULT_ROWS_PER_PAGE } from '@/lib/constants';
import { getCoreRowModel, getFacetedRowModel, getFacetedUniqueValues, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { columns, getRestaurantReviewColumns } from './table/columns';
import { DataTable } from './table/data-table';
import { ReservationDateCalendar } from '../reservation/_components/reservation-date-calendar';

export type ReviewPaginationRow = RouterOutputs['reservation']['reviewPagination']['data'][number]

export type RestaurantReviewRow = RouterOutputs['reservation']['getAllReviewsByLanguage'][number]
type Props = {}

const Page = (props: Props) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    const [reviewPaginationQuery, setReviewPaginationQuery] = useState<TReviewValidator.TReviewPaginationQuerySchema>({
        pagination: {
            page: 1,
            limit: 99
        },
        filters: {
            date
        },
        sort: {
            sortField: 'reviewedAt',
            sortBy: 'desc'
        }
    })

    const { data: reviews } = api.reservation.getAllReviewsByLanguage.useQuery();

    const { data: reviewsPagination } = api.reservation.reviewPagination.useQuery(reviewPaginationQuery);

    const [_columns, SetColumns] = useState(columns)

    useEffect(() => {
        SetColumns([...columns, ...getRestaurantReviewColumns(reviews ?? [])])
    }, [reviews])

    console.log(reviewsPagination?.data, 'reviewsPagination')

    const table = useReactTable({
        data: reviewsPagination?.data ?? [],
        columns: _columns,
        enableRowSelection: true,
        manualPagination: true,
        rowCount: reviewsPagination?.pagination.total,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    })

    

    return (
        <div>
            <ReservationDateCalendar
                date={reviewPaginationQuery.filters.date ?? date}
                setDate={(date) => setReviewPaginationQuery({ ...reviewPaginationQuery, filters: { ...reviewPaginationQuery.filters, date } })}
            />
            <DataTable columns={columns} table={table} />
        </div>
    )
}

export default Page