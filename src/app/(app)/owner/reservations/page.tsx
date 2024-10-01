"use client"
import { useSearchParams } from 'next/navigation'
import React, { Suspense } from 'react'
import { TReservationsViewType } from './_components/reservations-header'
import dynamic from 'next/dynamic'

type Props = {}
const ListView: any = dynamic(() => import('./_components/tabs/list-view'), {
    ssr: false,
});

const TableView: any = dynamic(() => import('./_components/tabs/table-view'), {
    ssr: false,
});


const page = (props: Props) => {
    const searchParams = useSearchParams()

    const view = (searchParams.get('view') || 'list') as TReservationsViewType


    return (
        view === 'list' ? <ListView /> : <TableView />
    )
}

export default page