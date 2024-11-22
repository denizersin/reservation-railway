"use client"
import { useSearchParams } from 'next/navigation'
import React, { Suspense, createContext, useContext, useState } from 'react'
import { ReservationHeader, TReservationsViewType } from './_components/reservations-header'
import dynamic from 'next/dynamic'

// New context type
type ReservationsContextType = {
    date: Date;
    queryDate: Date;
    setDate: (date: Date) => void;
}

const ReservationsContext = createContext<ReservationsContextType>({} as ReservationsContextType);

const ListView: any = dynamic(() => import('./_components/tabs/list-view'), {
    ssr: false,
});

const TableView: any = dynamic(() => import('./_components/tabs/table-view'), {
    ssr: false,
});

const page = (props: {}) => {
    const searchParams = useSearchParams()
    const view = (searchParams.get('view') || 'list') as TReservationsViewType

    // State for the context
    const [date, setDate] = useState<Date>(new Date());
    console.log('logg')

    const queryDate = React.useMemo(() => {
        const newDate = new Date(date)
        newDate.setHours(0, 0, 0, 0)
        return newDate
    }, [date])

    console.log(queryDate, 'queryDate22')

    return (
        <ReservationsContext.Provider value={{ date, setDate, queryDate }}>
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
