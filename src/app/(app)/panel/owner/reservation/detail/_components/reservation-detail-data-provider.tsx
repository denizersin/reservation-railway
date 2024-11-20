"use client"
import { TReservationDetail } from '@/lib/reservation'
import { TReservation } from '@/server/db/schema'
import { api } from '@/server/trpc/react'
import React from 'react'

type Props = {
    reservationDetailData: TReservationDetail
    children: React.ReactNode
}

export const ReservationDetailDataProvider = (props: Props) => {


    console.log(props.reservationDetailData,'reservationDetailData')
    const { data: reservationDetailData } = api.reservation.getReservationDetail.useQuery({
        reservationId: props.reservationDetailData.id
    }, {
        initialData: props.reservationDetailData
    })

    return props.children
}