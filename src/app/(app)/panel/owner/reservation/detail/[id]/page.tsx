import { ReservationEntities } from '@/server/layer/entities/reservation'
import React from 'react'
import { ReservationDetailDataProvider } from '../_components/reservation-detail-data-provider'
import { ReservationDetailPage } from '../reservation-detail-page'

type Props = {
    params: {
        id: string
    }
}

const page = async (props: Props) => {

    const reservationId = Number(props.params.id)

    const reservationDetailData = await ReservationEntities.getReservationDetail({ reservationId })


    return (
        <ReservationDetailDataProvider reservationDetailData={reservationDetailData}>
            <ReservationDetailPage />
        </ReservationDetailDataProvider>
    )
}

export default page