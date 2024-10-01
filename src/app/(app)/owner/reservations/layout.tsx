import React from 'react'
import { ReservationHeader } from './_components/reservations-header'

type Props = {
    children: React.ReactNode
}

const layout = (props: Props) => {
    return (
        <div className='flex flex-col'>
            <ReservationHeader />
            <div className='mt-4'>
            {props.children}
            </div>
        </div>
    )
}

export default layout