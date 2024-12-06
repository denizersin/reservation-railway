"use client"
import { api } from '@/server/trpc/react';
import { useParams } from 'next/navigation';
import { GeneralInformation } from './_components/general-information';
import { LogsInformation } from './_components/logs-information';
import { NotificationsInformation } from './_components/notifications-information';

type Props = {}

export const ReservationDetailPage = (props: Props) => {
    const { id } = useParams()

    const reservationId = Number(id)

    const { data: reservationDetailData } = api.reservation.getReservationDetail.useQuery({
        reservationId
    },{
        staleTime: 0
    })

    return (
        <div className="space-y-4">
            {reservationDetailData && (
                <>
                    <GeneralInformation reservationDetailData={reservationDetailData} />
                    <LogsInformation reservationDetailData={reservationDetailData} />
                    <NotificationsInformation reservationDetailData={reservationDetailData} />
                </>
            )}
        </div>  
    )
}