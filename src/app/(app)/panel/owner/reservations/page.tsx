"use client"
import { useSearchParams } from 'next/navigation'
import React, { Suspense, createContext, useContext, useMemo, useState } from 'react'
import { ReservationHeader, TReservationsViewType } from './_components/reservations-header'
import dynamic from 'next/dynamic'
import { TReservationRow } from '@/lib/reservation'
import { api } from '@/server/trpc/react'

// New context type
type ReservationsContextType = {
    date: Date;
    queryDate: Date;
    setDate: (date: Date) => void;
    reservationsData: TReservationRow[]
    rawReservationsData: TReservationRow[]
}

export const ReservationsContext = createContext<ReservationsContextType>({} as ReservationsContextType);

const ListView: any = dynamic(() => import('./_components/tabs/list-view'), {
    ssr: false,
});

const TableView: any = dynamic(() => import('./_components/tabs/table-view'), {
    ssr: false,
});

const page = (props: {}) => {
    const searchParams = useSearchParams()
    const view = (searchParams.get('view') || 'list') as TReservationsViewType

    const globalFilter = searchParams.get('globalFilter') || ''

    // State for the context
    const [date, setDate] = useState<Date>(new Date());
    console.log('logg')

    const queryDate = React.useMemo(() => {
        const newDate = new Date(date)
        newDate.setHours(0, 0, 0, 0)
        return newDate
    }, [date])

    const { data: rawReservationsData } = api.reservation.getReservations.useQuery({
        date: queryDate
    }, {
        staleTime: 0
    })



    const reservationsData: TReservationRow[] = useMemo(() => {
        if (!rawReservationsData) return []
        if (!globalFilter) return rawReservationsData

        const globalFilterLower = globalFilter.toLowerCase()
        const filteredReservations = rawReservationsData.filter((reservation) => {
            const guestName = reservation.guest?.name.toLowerCase() ?? ''
            const guestSurname = reservation.guest?.surname.toLowerCase() ?? ''
            const phone = reservation.guest?.phone.toLowerCase() ?? ''
            const companyName = reservation.guest?.company?.companyName?.toLowerCase() ?? ''
            return guestName.includes(globalFilterLower) ||
                guestSurname.includes(globalFilterLower) ||
                phone.includes(globalFilterLower) ||
                companyName?.includes(globalFilterLower)
        })

        return filteredReservations
    }, [rawReservationsData, globalFilter])




    return (
        <ReservationsContext.Provider value={{ date, setDate, queryDate, reservationsData, rawReservationsData: rawReservationsData || [] }}>
            <div className='flex flex-col'>
                <ReservationHeader />
                <div className='mt-4'>
                    {view === 'list' ? <ListView /> : <TableView />}
                </div>
            </div>
        </ReservationsContext.Provider>
    )
}

// New hook for the context
export const useReservationsContext = () => {
    const context = useContext(ReservationsContext);
    if (!context) {
        throw new Error('useReservationsContext must be used within a ReservationsProvider');
    }
    return context;
};

export default page
